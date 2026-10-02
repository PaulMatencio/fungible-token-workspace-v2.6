import { describe, expect, it } from 'vitest';
import { makeCompiledContract } from '@/infrastructure/contract/compiled';
import { generateSdkSource, generateTestSource, type ContractInfo } from '@/infrastructure/tooling/typeMap';
import { readFileSync } from 'node:fs';

describe('compiled contract wiring', () => {
  it('builds a CompiledContract for midnight-js', () => {
    const c = makeCompiledContract(() => new Uint8Array(32));
    expect(c).toBeTruthy();
  });
});

describe('generators', () => {
  const info = JSON.parse(readFileSync('contract/managed/fungible-token-v2.6/compiler/contract-info.json', 'utf8')) as ContractInfo;
  it('SDK exposes every impure circuit', () => {
    const f = generateSdkSource(info, 'fungible-token-v2.6', '../../contract/managed/fungible-token-v2.6');
    for (const n of ['mint', 'burn', 'transfer', 'rotateSigner', 'emergencyWithdraw']) expect(f['client.ts']).toContain(`async ${n}(`);
    expect(f['types.ts']).toContain('SchnorrSignature');
    // regressions found by type-checking the generated SDK: JubjubPoint must be imported, and index.ts must not
    // star-export the contract module (it would clash with client.ts's SchnorrSignature)
    expect(f['client.ts']).toMatch(/import type \{ JubjubPoint, TxData/);
    expect(f['index.ts']).not.toMatch(/export \* from '[^']*contract\/index/);
  });
  it('test generator emits a case per circuit', () => {
    const t = generateTestSource(info, 'fungible-token-v2.6', '../../contract/managed/fungible-token-v2.6');
    expect(t.match(/  it\('/g)!.length).toBe(info.circuits.length + 1);
  });
});

describe('toolchain compatibility with midnight-js', () => {
  it('compiled contract targets runtime 0.16 and is synchronous (compact-js 2.5.x destructures initialState directly)', async () => {
    const { Contract } = await import('@/infrastructure/contract/module');
    const { createConstructorContext, versionString } = await import('@midnight-ntwrk/compact-runtime');
    expect(versionString).toBe('0.16.0');
    const c = new Contract<undefined>({ localSecretKey: (x: any) => [x.privateState, new Uint8Array(32)], getSchnorrReduction: (x: any) => [x.privateState, [0n, 0n]] } as never);
    const z = new Uint8Array(32);
    const r = c.initialState(createConstructorContext(undefined, '00'.repeat(32)), z, z, 'a', 'b', 6n, 0n, [z, z.map(() => 1), z.map(() => 2)], 2n);
    expect(r).not.toBeInstanceOf(Promise);
    expect(r.currentZswapLocalState).toBeDefined();
  });
});

describe('staged deploy', () => {
  it('a subset contract exposes only the chosen circuits (so the deploy tx carries fewer verifier keys)', async () => {
    const { allCircuitIds, makeCompiledContract } = await import('@/infrastructure/contract/compiled');
    const { contractConfig } = await import('@/infrastructure/config/network');
    const all = allCircuitIds();
    expect(all).toHaveLength(12);
    expect(contractConfig.deployCircuits.length).toBeLessThan(all.length);
    for (const c of contractConfig.deployCircuits) expect(all).toContain(c);
    expect(makeCompiledContract(() => new Uint8Array(32), contractConfig.deployCircuits)).toBeTruthy();
  });

  it('tracker inserts dynamic steps before "save"', async () => {
    const { DeployTracker } = await import('@/application/deployProgress');
    const tr = new DeployTracker();
    tr.start('wallet');
    tr.extend([{ id: 'reg:mint', labelKey: 'deploy.step.register', label: 'Register mint' }]);
    const ids = tr.snapshot!.steps.map((s) => s.id);
    expect(ids.indexOf('reg:mint')).toBe(ids.indexOf('save') - 1);
    tr.extend([{ id: 'reg:mint', labelKey: 'deploy.step.register' }]); // idempotent
    expect(tr.snapshot!.steps.filter((s) => s.id === 'reg:mint')).toHaveLength(1);
  });
});

describe('deploy transaction size (cost guard)', () => {
  it('the staged deploy tx fits well inside a block; the all-circuits one is far larger', async () => {
    const { createUnprovenDeployTxFromVerifierKeys } = await import('@midnight-ntwrk/midnight-js-contracts');
    const { setNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');
    const ledger = await import('@midnight-ntwrk/ledger-v8');
    const { makeCompiledContract } = await import('@/infrastructure/contract/compiled');
    const { contractConfig } = await import('@/infrastructure/config/network');
    const { readFileSync } = await import('node:fs');
    setNetworkId('preprod');
    const vk = (id: string) => new Uint8Array(readFileSync(`${contractConfig.managedDir}/keys/${id}.verifier`));
    const zk = {
      getZKIR: async () => new Uint8Array(),
      getProverKey: async () => new Uint8Array(),
      getVerifierKey: async (id: string) => vk(id),
      getVerifierKeys: async (ids: string[]) => ids.map((id) => [id, vk(id)]),
      get: async (id: string) => ({ circuitId: id, verifierKey: vk(id) })
    };
    const z = new Uint8Array(32);
    const args = [z, z, 'T', 'T', 6n, 0n, [z.map(() => 1), z.map(() => 2), z.map(() => 3)], 2n];
    const fullness = async (circuits?: string[]) => {
      const out: any = await (createUnprovenDeployTxFromVerifierKeys as any)(zk, '00'.repeat(32), { compiledContract: makeCompiledContract(() => z, circuits), args }, '11'.repeat(32));
      const tx = out.private.unprovenTx.mockProve();
      const params = ledger.LedgerParameters.initialParameters();
      return { size: tx.serialize().length, f: params.normalizeFullness(tx.cost(params)) as { bytesWritten: number } };
    };
    // Regression for node error "InvalidTransaction::Custom(110) VerifierKeyNotSet": every operation in the
    // deployed state must carry a verifier key, and only the chosen circuits may be present.
    const probe: any = await (createUnprovenDeployTxFromVerifierKeys as any)(zk, '00'.repeat(32), { compiledContract: makeCompiledContract(() => z, contractConfig.deployCircuits), args }, '11'.repeat(32));
    const st = probe.public.initialContractState;
    const names = st.operations().map((o: unknown) => String(o)).sort();
    expect(names).toEqual([...contractConfig.deployCircuits].sort());
    for (const n of names) expect(st.operation(n).verifierKey).toBeDefined();
    const staged = await fullness(contractConfig.deployCircuits);
    const full = await fullness();
    expect(staged.size).toBeLessThan(full.size / 2);
    expect(staged.f.bytesWritten).toBeLessThan(0.4);
    expect(full.f.bytesWritten).toBeGreaterThan(0.6);
  }, 120_000);
});
