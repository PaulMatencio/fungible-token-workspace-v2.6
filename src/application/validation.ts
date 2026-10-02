import { MAX_UINT128, parseAmount } from '@/domain/amount';
import { AppError } from '@/domain/errors';
import { isHex32 } from '@/domain/hex';
import type { DeployParams } from './ports';

const bad = (m: string): never => {
  throw new AppError('VALIDATION', m);
};

export function requireAccount(v: string, label: string): string {
  const raw = v.trim();
  // A Midnight wallet address (Bech32m: mn_addr_…, mn_shield-addr_…, mn_dust_…) is NOT a token account.
  if (/^mn_[a-z0-9_-]+1[02-9ac-hj-np-z]{6,}$/i.test(raw) || raw.toLowerCase().startsWith('mn_')) {
    bad(`${label}: that is a Midnight wallet address. Tokens of this contract live in token accounts (64 hex), derived from a secret key — ask the recipient for the “Token account” shown in the app’s Your identity card.`);
  }
  const t = raw.replace(/^0x/, '').toLowerCase();
  if (!isHex32(t)) bad(`${label}: expected a 64-character hex account`);
  return t;
}

export function requireAmount(v: string, decimals: number, label = 'Amount'): bigint {
  let n: bigint;
  try {
    n = parseAmount(v, decimals);
  } catch (e) {
    return bad(`${label}: ${(e as Error).message}`);
  }
  if (n <= 0n) bad(`${label} must be greater than zero`);
  if (n > MAX_UINT128) bad(`${label} is too large`);
  return n;
}

export interface DeployForm {
  name: string;
  symbol: string;
  decimals: string;
  maxSupply: string;
  threshold: string;
  /** Three cosigner public keys as JSON `{"x":"…","y":"…"}` or `x,y`. */
  signerPubkeys: [string, string, string];
}

export function parsePubkey(s: string): { x: string; y: string } {
  const t = s.trim();
  try {
    if (t.startsWith('{')) {
      const j = JSON.parse(t) as { x?: string; y?: string };
      if (/^\d+$/.test(String(j.x)) && /^\d+$/.test(String(j.y))) return { x: String(j.x), y: String(j.y) };
    } else {
      const [x, y] = t.split(/[\s,]+/);
      if (/^\d+$/.test(x ?? '') && /^\d+$/.test(y ?? '')) return { x, y };
    }
  } catch {
    /* fallthrough */
  }
  return bad('Public key must be {"x":"…","y":"…"} (decimal), as printed by signer-tool keygen');
}

/** Validates the deploy form and derives salted signer commitments. */
export function buildDeployParams(
  f: DeployForm,
  commitmentFor: (pk: { x: string; y: string }, salt: string) => string,
  saltHex: string
): DeployParams {
  if (!f.name.trim() || f.name.length > 64) bad('Name is required (max 64 characters)');
  if (!/^[A-Za-z0-9]{1,12}$/.test(f.symbol.trim())) bad('Symbol: 1–12 letters/digits');
  const decimals = Number(f.decimals);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) bad('Decimals must be 0–255');
  const threshold = Number(f.threshold);
  if (![1, 2, 3].includes(threshold)) bad('Threshold must be 1, 2 or 3');
  let maxSupply = 0n;
  if (f.maxSupply.trim() !== '' && f.maxSupply.trim() !== '0') maxSupply = requireAmount(f.maxSupply, decimals, 'Max supply');
  const commitments = f.signerPubkeys.map((p) => commitmentFor(parsePubkey(p), saltHex));
  if (new Set(commitments).size !== 3) bad('The three cosigner keys must be distinct');
  return {
    name: f.name.trim(),
    symbol: f.symbol.trim(),
    decimals,
    maxSupply,
    threshold: threshold as 1 | 2 | 3,
    signerCommitments: commitments as [string, string, string],
    salt: saltHex
  };
}
