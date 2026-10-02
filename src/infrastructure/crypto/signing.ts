/**
 * Browser-safe port of signer-tools/src/lib.ts. Digests and the Schnorr
 * challenge come from the compiled SignerTools pure circuits, i.e. the same
 * standard-library code as the on-chain circuits — no hand-written hashing.
 */
import { sha512 } from '@noble/hashes/sha2.js';
import { signerTools as T } from '../contract/module';
import { bigIntToBytes32, bytesToBigInt, bytesToHex, hex32ToBytes } from '@/domain/hex';
import type { ApprovalFile, SigningRequest } from '@/domain/multisig';
import type { JubjubPointJson } from '@/domain/token';

export const JUBJUB_SCALAR_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;
/** BLS12-381 scalar field = Jubjub base field. */
const BLS_SCALAR_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184513n;
const TWO_248 = 1n << 248n;
const TWO_64 = 1n << 64n;
const TWO_128 = 1n << 128n;

export type Point = ReturnType<typeof T.derivePublicKey>;

export const pointToJson = (p: Point): JubjubPointJson => {
  const q = p as unknown as { x: bigint; y: bigint };
  return { x: q.x.toString(), y: q.y.toString() };
};
export const pointFromJson = (j: JubjubPointJson): Point => ({ x: BigInt(j.x), y: BigInt(j.y) }) as unknown as Point;
/** v2.6 padding for unused approval slots. NOT a curve point: the real prover rejects it (subgroup check). */
export const ZERO_POINT: Point = { x: 0n, y: 0n } as unknown as Point;
/** v3 padding: the curve's identity (0,1) is a valid subgroup point, so the real prover accepts it. */
export const IDENTITY_POINT: Point = { x: 0n, y: 1n } as unknown as Point;

export function randomBytes(n: number): Uint8Array {
  const out = new Uint8Array(n);
  globalThis.crypto.getRandomValues(out);
  return out;
}

export const randomScalar = (): bigint => (bytesToBigInt(randomBytes(64)) % (JUBJUB_SCALAR_ORDER - 1n)) + 1n;

function hedgedNonce(sk: bigint, digest: Uint8Array): bigint {
  const buf = new Uint8Array(96);
  buf.set(bigIntToBytes32(sk), 0);
  buf.set(digest, 32);
  buf.set(randomBytes(32), 64);
  return (bytesToBigInt(sha512(buf)) % (JUBJUB_SCALAR_ORDER - 1n)) + 1n;
}

export interface SchnorrSig {
  announcement: Point;
  response: bigint;
}

export const derivePublicKey = (sk: bigint): Point => T.derivePublicKey(sk);

export function signDigest(sk: bigint, pk: Point, digest: Uint8Array): SchnorrSig {
  if (digest.length !== 32) throw new Error('digest must be 32 bytes');
  const k = hedgedNonce(sk, digest);
  const announcement = T.derivePublicKey(k);
  const c = T.schnorrChallenge(announcement, pk, digest) % TWO_248;
  const response = (k + sk * c) % JUBJUB_SCALAR_ORDER;
  if (!T.schnorrEquationHolds(announcement, response, pk, c)) throw new Error('Signature self-verification failed');
  return { announcement, response };
}

/** Verifies a signature over `digest` with the same equation the circuit checks. */
export function verifyDigest(pk: Point, sig: SchnorrSig, digest: Uint8Array): boolean {
  const c = T.schnorrChallenge(sig.announcement, pk, digest) % TWO_248;
  return T.schnorrEquationHolds(sig.announcement, sig.response, pk, c);
}

/** Refuses to run if the runtime's JubjubPoint representation differs from what we assume. */
export function selfTest(): void {
  const g = T.derivePublicKey(1n) as unknown as { x: unknown; y: unknown };
  if (typeof g.x !== 'bigint' || typeof g.y !== 'bigint') throw new Error('SELFTEST: JubjubPoint is not {x,y}');
  // (r-1)·G must equal −G = (−x, y) on a twisted Edwards curve. This validates both the point
  // representation and the subgroup-order constant without feeding an out-of-range scalar to the runtime.
  const neg = T.derivePublicKey(JUBJUB_SCALAR_ORDER - 1n) as unknown as { x: bigint; y: bigint };
  const gp = g as unknown as { x: bigint; y: bigint };
  if (!(neg.y === gp.y && neg.x === BLS_SCALAR_FIELD - gp.x)) throw new Error('SELFTEST: (r-1)·G is not −G');
}

function parseUint(s: string, limit: bigint, name: string): bigint {
  if (!/^\d+$/.test(s)) throw new Error(`${name}: must be a non-negative decimal integer`);
  const v = BigInt(s);
  if (v >= limit) throw new Error(`${name}: out of range`);
  return v;
}

export function computeDigest(req: SigningRequest): Uint8Array {
  if (req.version !== 1) throw new Error('Unsupported request version');
  const addr = hex32ToBytes(req.contractAddress, 'contractAddress');
  const nonce = parseUint(req.nonce, TWO_64, 'nonce');
  const op = req.op;
  switch (op.type) {
    case 'mint':
      return T.mintDigest(addr, nonce, hex32ToBytes(op.to, 'to'), parseUint(op.value, TWO_128, 'value'));
    case 'burn':
      return T.burnDigest(addr, nonce, hex32ToBytes(op.account, 'account'), parseUint(op.value, TWO_128, 'value'));
    case 'setEmergencyPauser':
      return T.setEmergencyPauserDigest(addr, nonce, hex32ToBytes(op.newPauser, 'newPauser'));
    case 'adminReallocate':
      return T.adminReallocateDigest(
        addr,
        nonce,
        hex32ToBytes(op.trappedAccount, 'trappedAccount'),
        hex32ToBytes(op.targetSpendableAccount, 'targetSpendableAccount'),
        parseUint(op.amount, TWO_128, 'amount')
      );
    case 'rotateSigner':
      if (!req.contractSalt) throw new Error('rotateSigner requests need contractSalt');
      return T.rotateSignerDigest(
        addr,
        nonce,
        hex32ToBytes(op.oldSignerCommitment, 'oldSignerCommitment'),
        pointFromJson(op.newSignerPubkey),
        hex32ToBytes(req.contractSalt, 'contractSalt')
      );
  }
}

export const popDigestFor = (rotateDigest: Uint8Array): Uint8Array => T.rotatePopDigest(rotateDigest);

export const signerCommitment = (pk: Point, saltHex: string): string =>
  bytesToHex(T.calculateSignerCommitment(pk, hex32ToBytes(saltHex, 'salt')));

/** Produces a signer-tool compatible approval file (used by Test Mode signers). */
export function makeApprovalFile(
  req: SigningRequest,
  sk: bigint,
  pk: Point,
  kind: 'approval' | 'pop' = 'approval'
): ApprovalFile {
  let digest = computeDigest(req);
  if (kind === 'pop') digest = popDigestFor(digest);
  const sig = signDigest(sk, pk, digest);
  return {
    version: 1,
    kind,
    operation: req.op.type,
    contractAddress: req.contractAddress,
    nonce: req.nonce,
    digest: bytesToHex(digest),
    publicKey: pointToJson(pk),
    signature: { announcement: pointToJson(sig.announcement), response: sig.response.toString() }
  };
}

/**
 * Verifies an uploaded approval against the request it claims to answer:
 * digest must equal the digest we recompute ourselves, and the signature
 * must verify. Never trust the file's own `digest` field.
 */
export function verifyApprovalFile(req: SigningRequest, f: ApprovalFile): { ok: true } | { ok: false; reason: string } {
  try {
    let expected = computeDigest(req);
    if (f.kind === 'pop') expected = popDigestFor(expected);
    if (bytesToHex(expected) !== f.digest.toLowerCase()) return { ok: false, reason: 'Digest does not match this request' };
    const ok = verifyDigest(
      pointFromJson(f.publicKey),
      { announcement: pointFromJson(f.signature.announcement), response: BigInt(f.signature.response) },
      expected
    );
    return ok ? { ok: true } : { ok: false, reason: 'Signature does not verify' };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
