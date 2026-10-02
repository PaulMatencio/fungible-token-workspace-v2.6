import { describe, expect, it } from 'vitest';
import { SimulatorGateway } from '@/infrastructure/gateway/simulatorGateway';
import { deriveAccount, generateSecretKey } from '@/infrastructure/crypto/identity';
import { derivePublicKey, makeApprovalFile, randomScalar, selfTest, signerCommitment, verifyApprovalFile } from '@/infrastructure/crypto/signing';
import type { SigningRequest } from '@/domain/multisig';

const salt = 'ab'.repeat(32);

async function setup(threshold: 1 | 2 | 3 = 2) {
  const keys = new Map<string, Uint8Array>();
  const mk = () => {
    const sk = generateSecretKey();
    const a = deriveAccount(sk, salt);
    keys.set(a, sk);
    return a;
  };
  const owner = mk(), alice = mk(), bob = mk();
  const signers = [0, 1, 2].map(() => {
    const sk = randomScalar();
    const pk = derivePublicKey(sk);
    return { sk, pk, commitment: signerCommitment(pk, salt) };
  });
  const gw = await SimulatorGateway.deploy(
    { name: 'Test', symbol: 'TST', decimals: 6, maxSupply: 0n, salt, threshold, signerCommitments: [signers[0].commitment, signers[1].commitment, signers[2].commitment] },
    owner,
    (a) => keys.get(a)!
  );
  const sign = async (op: SigningRequest['op'], who: number[]) => {
    const st = await gw.getState();
    const req: SigningRequest = { version: 1, contractAddress: gw.contractAddress, contractSalt: salt, nonce: st.multisigNonce.toString(), op };
    return { req, files: who.map((i) => makeApprovalFile(req, signers[i].sk, signers[i].pk)) };
  };
  return { gw, owner, alice, bob, signers, sign };
}

describe('simulator + signing (v2.6)', () => {
  it('self-test passes', () => selfTest());

  it('mints with threshold approvals, then transfers', async () => {
    const { gw, alice, bob, sign } = await setup(2);
    const { req, files } = await sign({ type: 'mint', to: alice, value: '1000' }, [0, 1]);
    expect(verifyApprovalFile(req, files[0]).ok).toBe(true);
    await gw.executeMultisig(req.op, files);
    expect(await gw.balanceOf(alice)).toBe(1000n);
    await gw.transfer(alice, bob, 250n);
    expect(await gw.balanceOf(bob)).toBe(250n);
    expect((await gw.getState()).multisigNonce).toBe(1n);
  });

  it('rejects below-threshold approvals, wrong callers and tampered digests', async () => {
    const { gw, alice, bob, sign } = await setup(2);
    const { req, files } = await sign({ type: 'mint', to: alice, value: '5' }, [0]);
    await expect(gw.executeMultisig(req.op, files)).rejects.toThrow(/threshold not met/);
    await expect(gw.transfer(alice, bob, 1n)).rejects.toThrow();
    expect(verifyApprovalFile({ ...req, op: { type: 'mint', to: alice, value: '6' } }, files[0]).ok).toBe(false);
  });

  it('pause blocks transfers; owner can unpause', async () => {
    const { gw, owner, alice, bob, sign } = await setup(1);
    const { req, files } = await sign({ type: 'mint', to: alice, value: '10' }, [0]);
    await gw.executeMultisig(req.op, files);
    await gw.pause(owner);
    await expect(gw.transfer(alice, bob, 1n)).rejects.toThrow(/paused/);
    await gw.unpause(owner);
    await gw.transfer(alice, bob, 1n);
  });

  it('rotates a signer with proof of possession', async () => {
    const { gw, signers, sign } = await setup(2);
    const sk = randomScalar();
    const pk = derivePublicKey(sk);
    const op = { type: 'rotateSigner' as const, oldSignerCommitment: signers[2].commitment, newSignerPubkey: { x: String((pk as any).x), y: String((pk as any).y) } };
    const { req, files } = await sign(op, [0, 1]);
    const pop = makeApprovalFile(req, sk, pk, 'pop');
    expect(verifyApprovalFile(req, pop).ok).toBe(true);
    await gw.executeMultisig(op, files, pop);
    const st = await gw.getState();
    expect(st.signerCommitments).toContain(signerCommitment(pk, salt));
    expect(st.signerCommitments).not.toContain(signers[2].commitment);
  });
});

describe('simulator persistence', () => {
  it('restores identical state by replaying a snapshot', async () => {
    const { gw, alice, bob, sign } = await setup(2);
    const { req, files } = await sign({ type: 'mint', to: alice, value: '500' }, [0, 1]);
    await gw.executeMultisig(req.op, files);
    await gw.transfer(alice, bob, 100n);
    const snap = JSON.parse(JSON.stringify(gw.snapshot()));
    const restored = await SimulatorGateway.restore(snap, (a) => (gw as any).resolveSk(a));
    expect(await restored.balanceOf(bob)).toBe(100n);
    expect((await restored.getState()).multisigNonce).toBe(1n);
    expect(restored.contractAddress).toBe(gw.contractAddress);
  });
});
