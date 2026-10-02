/** Byte / hex helpers shared by every layer. Pure and framework-free. */

export function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export function hexToBytes(hex: string): Uint8Array {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (h.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(h)) throw new Error('Invalid hex string');
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export const isHex32 = (s: string): boolean => /^(0x)?[0-9a-fA-F]{64}$/.test(s.trim());

export function hex32ToBytes(hex: string, label = 'value'): Uint8Array {
  const t = hex.trim();
  if (!isHex32(t)) throw new Error(`${label}: expected 64 hex characters (32 bytes)`);
  return hexToBytes(t);
}

export function bytesToBigInt(b: Uint8Array): bigint {
  let v = 0n;
  for (const byte of b) v = (v << 8n) | BigInt(byte);
  return v;
}

export function bigIntToBytes32(v: bigint): Uint8Array {
  const out = new Uint8Array(32);
  let x = v;
  for (let i = 31; i >= 0; i--) {
    out[i] = Number(x & 0xffn);
    x >>= 8n;
  }
  if (x !== 0n) throw new Error('value does not fit in 32 bytes');
  return out;
}

export const shortHex = (hex: string, head = 8, tail = 6): string =>
  hex.length <= head + tail + 1 ? hex : `${hex.slice(0, head)}…${hex.slice(-tail)}`;
