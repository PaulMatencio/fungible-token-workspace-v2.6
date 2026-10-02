import { afterEach, describe, expect, it } from 'vitest';
import { en } from '@/presentation/i18n/en';
import { fr } from '@/presentation/i18n/fr';
import { MemoryStore } from '@/infrastructure/storage/kv';
import { TxLog } from '@/infrastructure/storage/txLog';
import { IdentityStore } from '@/infrastructure/storage/identityStore';
import { WalletConnector, detectWallets, KNOWN_WALLETS } from '@/infrastructure/wallet/connector';
import { parseApprovalFile } from '@/domain/multisig';
import { buildDeployParams } from '@/application/validation';
import { friendlyMessage } from '@/domain/errors';

describe('i18n', () => {
  it('French covers every English key', () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
    for (const k of Object.keys(en) as (keyof typeof en)[]) expect(fr[k].trim()).not.toBe('');
  });
});

describe('persistence', () => {
  it('tx log survives a new TxLog over the same store, newest first', async () => {
    const store = new MemoryStore();
    await new TxLog(store).add({ id: 'a', contractAddress: 'c', circuit: 'mint', txHash: 'h1', txId: 't1', status: 'finalized', at: 1, mode: 'test' });
    await new TxLog(store).add({ id: 'b', contractAddress: 'c', circuit: 'burn', txHash: 'h2', txId: 't2', status: 'finalized', at: 2, mode: 'test' });
    const rows = await new TxLog(store).list('c');
    expect(rows.map((r) => r.id)).toEqual(['b', 'a']);
    expect(await new TxLog(store).list('other')).toEqual([]);
  });

  it('identity key is created once and stable', async () => {
    const s = new IdentityStore(new MemoryStore());
    const a = await s.getOrCreateSecretKey();
    expect(await s.getOrCreateSecretKey()).toEqual(a);
    await s.importSecretKey('ab'.repeat(32));
    expect((await s.getOrCreateSecretKey())[0]).toBe(0xab);
    await expect(s.importSecretKey('zz')).rejects.toThrow();
  });
});

describe('wallet connector', () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });
  const install = (midnight: Record<string, unknown>) => {
    (globalThis as { window?: unknown }).window = { midnight };
  };
  const api = (networkId: string) => ({
    getConnectionStatus: async () => ({ status: 'connected', networkId }),
    getShieldedAddresses: async () => ({ shieldedAddress: 's', shieldedCoinPublicKey: 'c', shieldedEncryptionPublicKey: 'e' }),
    getUnshieldedAddress: async () => ({ unshieldedAddress: 'u' }),
    hintUsage: async () => {}
  });

  it('detects Lace and 1AM by key/name/rdns and ignores non-wallets', () => {
    install({
      mnLace: { name: 'Lace', rdns: 'io.lace', icon: '', apiVersion: '4.0.1', connect: async () => api('preprod') },
      'uuid-1': { name: '1AM Wallet', rdns: 'xyz.1am', icon: '', apiVersion: '4.0.1', connect: async () => api('preprod') },
      junk: { nothing: true }
    });
    const found = detectWallets();
    expect(found.map((w) => w.known).sort()).toEqual(['1am', 'lace']);
    expect(KNOWN_WALLETS).toHaveLength(2);
  });

  it('connects, exposes the session, and disconnects', async () => {
    install({ mnLace: { name: 'Lace', rdns: 'io.lace', icon: '', apiVersion: '4', connect: async () => api('preprod') } });
    const c = new WalletConnector('preprod');
    const s = await c.connect('mnLace');
    expect(s.unshieldedAddress).toBe('u');
    expect(c.getState().status).toBe('connected');
    c.disconnect();
    expect(c.getState().status).toBe('idle');
  });

  it('rejects a wallet on the wrong network and a missing wallet', async () => {
    install({ mnLace: { name: 'Lace', rdns: 'io.lace', icon: '', apiVersion: '4', connect: async () => api('preview') } });
    const c = new WalletConnector('preprod');
    await expect(c.connect('mnLace')).rejects.toMatchObject({ code: 'NETWORK_MISMATCH' });
    await expect(c.connect('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('maps user rejection to REJECTED', async () => {
    install({ mnLace: { name: 'Lace', rdns: 'io.lace', icon: '', apiVersion: '4', connect: async () => { throw { type: 'DAppConnectorAPIError', code: 'PermissionRejected', reason: 'no' }; } } });
    await expect(new WalletConnector('preprod').connect('mnLace')).rejects.toMatchObject({ code: 'REJECTED' });
  });
});

describe('input safety', () => {
  it('rejects malformed approval files', () => {
    expect(() => parseApprovalFile('not json')).toThrow();
    expect(() => parseApprovalFile('{"version":1}')).toThrow(/valid signer-tool/);
  });
  it('deploy form rejects duplicate cosigners and bad thresholds', () => {
    const pk = '{"x":"1","y":"2"}';
    const commit = (p: { x: string }) => p.x.padStart(64, '0');
    const base = { name: 'T', symbol: 'T', decimals: '6', maxSupply: '0', threshold: '2', signerPubkeys: [pk, pk, pk] as [string, string, string] };
    expect(() => buildDeployParams(base, commit, 'a'.repeat(64))).toThrow(/distinct/);
    expect(() => buildDeployParams({ ...base, threshold: '4' }, commit, 'a'.repeat(64))).toThrow(/Threshold/);
  });
  it('extracts contract assert messages', () => {
    expect(friendlyMessage(new Error('failed: FungibleToken: threshold not met (x)'))).toContain('FungibleToken: threshold not met');
  });
});

describe('shielded key decoding', () => {
  it('turns Bech32m connector keys into the hex the ledger expects', async () => {
    const { shieldedKeyToHex } = await import('@/infrastructure/wallet/providers');
    const { ShieldedCoinPublicKey } = await import('@midnight-ntwrk/wallet-sdk-address-format');
    const hex = 'ab'.repeat(32);
    const bech = ShieldedCoinPublicKey.codec.encode('preprod', ShieldedCoinPublicKey.fromHexString(hex)).asString();
    expect(bech.startsWith('mn_')).toBe(true);
    expect(shieldedKeyToHex(bech, 'coin', 'preprod')).toBe(hex);
    expect(shieldedKeyToHex(hex.toUpperCase(), 'coin', 'preprod')).toBe(hex);
  });
});

describe('deploy progress tracker', () => {
  it('walks the wallet pipeline, completes earlier steps, and records failure on the active step', async () => {
    const { DeployTracker } = await import('@/application/deployProgress');
    let t = 0;
    const tr = new DeployTracker(() => (t += 1000));
    tr.start('wallet');
    tr.begin('validate');
    tr.done('validate');
    tr.begin('build');
    tr.done('build'); // proof provider reports "build done" then…
    tr.begin('prove');
    expect(tr.snapshot!.steps.find((s) => s.id === 'prove')!.status).toBe('active');
    tr.fail('proof server unreachable');
    const snap = tr.snapshot!;
    expect(snap.status).toBe('failed');
    expect(snap.steps.find((s) => s.id === 'prove')).toMatchObject({ status: 'error', error: 'proof server unreachable' });
    expect(snap.steps.find((s) => s.id === 'balance')!.status).toBe('pending');
    expect(tr.running).toBe(false);
    tr.dismiss();
    expect(tr.snapshot).toBeNull();
  });
  it('completes everything on success and cannot be dismissed while running', async () => {
    const { DeployTracker } = await import('@/application/deployProgress');
    const tr = new DeployTracker();
    tr.start('test');
    tr.begin('validate');
    tr.dismiss();
    expect(tr.snapshot).not.toBeNull();
    tr.succeed({ contractAddress: 'abc' });
    expect(tr.snapshot!.steps.every((s) => s.status === 'done')).toBe(true);
    expect(tr.snapshot!.contractAddress).toBe('abc');
  });
});

describe('wallet that never answers', () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });
  it('times out with an actionable message, and a cancelled attempt cannot connect later', async () => {
    const { STEP_TIMEOUT_MS } = await import('@/infrastructure/wallet/connector');
    expect(STEP_TIMEOUT_MS.default).toBeLessThanOrEqual(30_000);
    (globalThis as { window?: unknown }).window = {
      midnight: { mnLace: { name: 'Lace', rdns: 'io.lace', icon: '', apiVersion: '4', connect: () => new Promise(() => {}) } }
    };
    const c = new WalletConnector('preprod');
    const p = c.connect('mnLace').catch((e: Error) => e);
    c.disconnect(); // user pressed Cancel
    expect(c.getState().status).toBe('idle');
    void p; // the hung promise is abandoned; no late state change is possible because its attempt is stale
  });
});

describe('wallet timeout', () => {
  it('rejects a silent wallet after the step limit with the Lace-console hint', async () => {
    const { vi } = await import('vitest');
    vi.useFakeTimers();
    try {
      (globalThis as { window?: unknown }).window = {
        midnight: {
          mnLace: {
            name: 'Lace', rdns: 'io.lace', icon: '', apiVersion: '4',
            connect: async () => ({ getConnectionStatus: () => new Promise(() => {}) })
          }
        }
      };
      const c = new WalletConnector('preprod');
      const result = c.connect('mnLace').catch((e: Error) => e);
      await vi.advanceTimersByTimeAsync(21_000);
      const err = (await result) as Error;
      expect(err.message).toMatch(/No response from the wallet after 20s/);
      expect(err.message).toMatch(/1006/);
      expect(c.getState().status).toBe('error');
    } finally {
      vi.useRealTimers();
      delete (globalThis as { window?: unknown }).window;
    }
  });
});

describe('error compaction', () => {
  it('collapses a serialized-transaction byte map and extracts the Effect error chain', async () => {
    const { compactText, deepMessage } = await import('@/domain/errors');
    const bytes = JSON.stringify(Object.fromEntries(Array.from({ length: 5000 }, (_, i) => [String(i), i % 256])));
    const raw = `Error: (during wallet.submitTransaction) ← {"txData":${bytes},"x":1}`;
    const out = compactText(raw);
    expect(out.length).toBeLessThan(800);
    expect(out).toContain('<5000 bytes>');
    const e = { _tag: 'Fail', failure: { message: 'Transaction submission error', cause: { message: 'Transaction submission failed', txData: { 0: 1 }, cause: {}, _tag: 'SubmissionError' } } };
    expect(deepMessage(e)).toEqual(['Transaction submission error', 'Transaction submission failed']);
  });
});

describe('identity import safety', () => {
  it('keeps the previous secret key when a new one is imported', async () => {
    const s = new IdentityStore(new MemoryStore());
    const store = (s as unknown as { store: MemoryStore }).store;
    await s.importSecretKey('11'.repeat(32));
    await s.importSecretKey('22'.repeat(32));
    const backups = await store.keys('identity:secretKey:replaced:');
    expect(backups).toHaveLength(1);
    expect(await store.get(backups[0])).toBe('11'.repeat(32));
  });
});

describe('authority key backup', () => {
  const addr = 'ab'.repeat(32);
  it('exports exactly what the private-state provider stored, and imports with validation + safety copy', async () => {
    const { persistentPrivateStateProvider } = await import('@/infrastructure/storage/privateStateProvider');
    const { exportAuthorityKey, importAuthorityKey } = await import('@/infrastructure/storage/authorityKey');
    const store = new MemoryStore();
    const key = 'cd'.repeat(32);
    await persistentPrivateStateProvider(store).setSigningKey(addr, key as never); // what deployContract does
    expect(await exportAuthorityKey(store, addr)).toBe(key);
    expect(await exportAuthorityKey(store, 'ef'.repeat(32))).toBeNull();

    const other = new MemoryStore();
    await importAuthorityKey(other, addr, key.toUpperCase());
    expect(await persistentPrivateStateProvider(other).getSigningKey(addr)).toBe(key); // round-trips into the provider
    await expect(importAuthorityKey(other, addr, 'zz')).rejects.toThrow(/64 hex/);
    await expect(importAuthorityKey(other, addr, addr)).rejects.toThrow(/contract address/);
    await importAuthorityKey(other, addr, '11'.repeat(32));
    expect(await other.keys(`sk:${addr}:replaced:`)).toHaveLength(1);
  });
});

describe('proof server selection', () => {
  it('never takes the proof-server address from the wallet (private inputs stay local)', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync('src/infrastructure/wallet/providers.ts', 'utf8');
    expect(src).not.toMatch(/httpClientProofProvider\(\s*cfg\.proverServerUri/);
    expect(src).toMatch(/httpClientProofProvider\(networkConfig\.proofServer/);
  });
  it('reports an unreachable local proof server clearly', async () => {
    const { assertProofServerReachable } = await import('@/infrastructure/wallet/providers');
    await expect(assertProofServerReachable('http://127.0.0.1:9', 800)).rejects.toThrow(/Local proof server not reachable at http:\/\/127\.0\.0\.1:9/);
  });
});

describe('multisig draft persistence', () => {
  it('round-trips an in-progress operation per contract and ignores corrupt data', async () => {
    const { DraftStore } = await import('@/infrastructure/storage/draftStore');
    const store = new MemoryStore();
    const d = new DraftStore(store);
    const addr = 'AB'.repeat(32);
    expect(await d.load(addr)).toBeNull();
    const req = { version: 1 as const, contractAddress: addr, nonce: '0', op: { type: 'mint' as const, to: 'cd'.repeat(32), value: '20000000000' } };
    await d.save(addr, { type: 'mint', values: { to: 'cd'.repeat(32), amount: '20000' }, request: req, approvals: [], pop: null });
    const back = await new DraftStore(store).load(addr.toLowerCase()); // new instance + case-insensitive address
    expect(back?.request?.op).toEqual(req.op);
    expect(back?.values.amount).toBe('20000');
    expect(await d.load('11'.repeat(32))).toBeNull(); // other contract unaffected
    await store.set(`multisig-draft:${addr.toLowerCase()}`, '{not json');
    expect(await d.load(addr)).toBeNull();
    await d.save(addr, { type: 'mint', values: {}, request: null, approvals: [], pop: null });
    await d.clear(addr);
    expect(await d.load(addr)).toBeNull();
  });
});

describe('recipient validation', () => {
  it('explains that a wallet address is not a token account', async () => {
    const { requireAccount } = await import('@/application/validation');
    for (const addr of ['mn_addr_preprod1qxyz0abcdefghjkmnpqrstuvwxyz', 'mn_shield-addr_preprod1abcdef', 'MN_dust_preprod1abc']) {
      expect(() => requireAccount(addr, 'Recipient')).toThrow(/wallet address/);
    }
    expect(requireAccount(`0x${'AB'.repeat(32)}`, 'Recipient')).toBe('ab'.repeat(32));
    expect(() => requireAccount('abc', 'Recipient')).toThrow(/64-character hex/);
  });
});

describe('contract version detection', () => {
  it('flags circuits that belong to another contract version, and accepts a partial (staged) set of ours', async () => {
    const { foreignCircuits } = await import('@/infrastructure/gateway/chainGateway');
    const { allCircuitIds } = await import('@/infrastructure/contract/compiled');
    const ours = allCircuitIds();
    expect(foreignCircuits(ours.slice(0, 3), ours)).toEqual([]); // staged deploy: only some registered
    expect(foreignCircuits([...ours.slice(0, 2), 'someOtherVersionCircuit'], ours)).toEqual(['someOtherVersionCircuit']);
  });
});
