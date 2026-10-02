import { CompactTypeBytes, CompactTypeVector, persistentHash } from '@midnight-ntwrk/compact-runtime';
import { bytesToHex, hex32ToBytes } from '@/domain/hex';
import { randomBytes } from './signing';

const AUTH_TAG = 'fungible-token:auth';

/** Compact `pad(32, "…")`: UTF-8 bytes right-padded with zeros. */
export function pad32(s: string): Uint8Array {
  const enc = new TextEncoder().encode(s);
  if (enc.length > 32) throw new Error('tag longer than 32 bytes');
  const out = new Uint8Array(32);
  out.set(enc);
  return out;
}

const HASH_TYPE = new CompactTypeVector(3, new CompactTypeBytes(32));

/**
 * Mirrors the contract's `authenticate()`:
 *   account = persistentHash([pad(32,"fungible-token:auth"), _contractSalt, sk])
 */
export function deriveAccount(secretKey: Uint8Array, contractSaltHex: string): string {
  return bytesToHex(persistentHash(HASH_TYPE, [pad32(AUTH_TAG), hex32ToBytes(contractSaltHex, 'salt'), secretKey]));
}

export const generateSecretKey = (): Uint8Array => randomBytes(32);
