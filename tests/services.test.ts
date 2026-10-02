import { describe, expect, it } from 'vitest';
import { MultisigService } from '@/application/multisigService';
import { TokenService } from '@/application/tokenService';
import { buildDeployParams } from '@/application/validation';
import { formatAmount, parseAmount } from '@/domain/amount';
import { resolveRole } from '@/domain/roles';
import { SimulatorGateway } from '@/infrastructure/gateway/simulatorGateway';
import { deriveAccount, generateSecretKey } from '@/infrastructure/crypto/identity';
import { derivePublicKey, makeApprovalFile, pointToJson, randomScalar } from '@/infrastructure/crypto/signing';
import { signerCrypto } from '@/infrastructure/crypto/signerCrypto';
import { MemoryStore } from '@/infrastructure/storage/kv';
import { TxLog } from '@/infrastructure/storage/txLog';

const salt = 'cd'.repeat(32);

describe('amounts', () => {
  it('round-trips decimals', () => {
    expect(parseAmount('12.5', 6)).toBe(12_500_000n);
    expect(formatAmount(12_500_000n, 6)).toBe('12.5');
    expect(formatAmount(200_000_000_000n, 6, { group: true })).toBe('200,000');
    expect(() => parseAmount('1.1234567', 6)).toThrow();
  });
});

describe('roles', () => {
  it('resolves manager / cosigner / user', () => {
    const base = { owner: 'a'.repeat(64), registeredCommitments: ['c'.repeat(64)] };
    expect(resolveRole({ ...base, account: 'a'.repeat(64) }).role).toBe('manager');
    expect(resolveRole({ ...base, account: 'b'.repeat(64), signerCommitment: 'c'.repeat(64) }).role).toBe('cosigner');
    expect(resolveRole({ ...base, account: 'b'.repeat(64) }).role).toBe('user');
  });
});

async function deployed(threshold: '1' | '2' | '3' = '2') {
  const keys = new Map<string, Uint8Array>();
  const acct = () => { const sk = generateSecretKey(); const a = deriveAccount(sk, salt); keys.set(a, sk); return a; };
  const [owner, alice, bob] = [acct(), acct(), acct()];
  const signers = [0, 1, 2].map(() => { const s = randomScalar(); return { sk: s, pk: derivePublicKey(s) }; });
  const params = buildDeployParams(
    { name: 'Token', symbol: 'TKN', decimals: '6', maxSupply: '1000000', threshold, signerPubkeys: signers.map((s) => JSON.stringify(pointToJson(s.pk))) as [string, string, string] },
    signerCrypto.commitmentFor, salt
  );
  const gw = await SimulatorGateway.deploy(params, owner, (a) => keys.get(a)!);
  const ms = new MultisigService(gw, signerCrypto, 'preprod', 6);
  return { gw, ms, owner, alice, bob, signers };
}

describe('end-to-end services on the simulator (v2.6)', () => {
  it('deploy form → mint via offline approvals → transfer → persistent log', async () => {
    const { gw, ms, alice, bob, signers } = await deployed();
    const state = await gw.getState();
    const req = ms.buildRequest(state, { type: 'mint', to: alice, amount: '100' });
    const approvals = signers.slice(0, 2).map((s) => ms.acceptApproval(req, state, JSON.stringify(makeApprovalFile(req, s.sk, s.pk))));
    await ms.submit(req, approvals);
    expect(await gw.balanceOf(alice)).toBe(100_000_000n);
    await expect(ms.submit(req, approvals)).rejects.toThrow(/Nonce changed/);

    const log = new TxLog(new MemoryStore());
    const svc = new TokenService(gw, log, alice, 6);
    await svc.transfer(bob, '25.5');
    expect(await svc.balanceOf(bob)).toBe(25_500_000n);
    await expect(svc.transfer(bob, '1000')).rejects.toThrow();
    const rows = await log.list(gw.contractAddress);
    expect(rows.map((r) => r.status).sort()).toEqual(['failed', 'finalized']);
  });

  it('rejects approvals from unregistered signers', async () => {
    const { gw, ms, owner } = await deployed('1');
    const state = await gw.getState();
    const req = ms.buildRequest(state, { type: 'mint', to: owner, amount: '1' });
    const rogue = randomScalar();
    expect(() => ms.acceptApproval(req, state, JSON.stringify(makeApprovalFile(req, rogue, derivePublicKey(rogue))))).toThrow(/not registered/);
  });

  it('requires all 3 approvals on-chain (the v2.6 zero-point padding is rejected by the real prover)', () => {
    const wallet = new MultisigService({ mode: 'wallet' } as never, signerCrypto, 'preprod', 0);
    const test = new MultisigService({ mode: 'test' } as never, signerCrypto, 'preprod', 0);
    expect(wallet.requiredApprovals({ multisigThreshold: 2 } as never)).toBe(3);
    expect(test.requiredApprovals({ multisigThreshold: 2 } as never)).toBe(2);
  });

  it('reports action progress for success and failure', async () => {
    const { actionTracker } = await import('@/application/deployProgress');
    const { gw, alice, bob, ms, signers } = await deployed();
    const state = await gw.getState();
    const req = ms.buildRequest(state, { type: 'mint', to: alice, amount: '10' });
    const approvals = signers.slice(0, 2).map((s) => ms.acceptApproval(req, state, JSON.stringify(makeApprovalFile(req, s.sk, s.pk))));
    await ms.submit(req, approvals);
    expect(actionTracker.snapshot).toMatchObject({ title: 'mint', status: 'success' });
    const svc = new TokenService(gw, new TxLog(new MemoryStore()), alice, 6);
    await svc.transfer(bob, '3');
    await expect(svc.transfer(bob, '1000')).rejects.toThrow();
    expect(actionTracker.snapshot!.status).toBe('failed');
  });
});
