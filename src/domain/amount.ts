/** Token amount parsing / formatting. Amounts are Uint<128> base units (bigint). */

export const MAX_UINT128 = (1n << 128n) - 1n;

/** Parses a human decimal string ("12.5") into base units for the given decimals. */
export function parseAmount(input: string, decimals: number): bigint {
  const t = input.trim();
  if (!/^\d+(\.\d+)?$/.test(t)) throw new Error('Enter a non-negative number');
  const [whole, frac = ''] = t.split('.');
  if (frac.length > decimals) throw new Error(`At most ${decimals} decimal places`);
  const v = BigInt(whole + frac.padEnd(decimals, '0'));
  if (v > MAX_UINT128) throw new Error('Amount exceeds Uint<128>');
  return v;
}

/** `group: true` inserts thousands separators in the whole part (display only; never parse the result). */
export function formatAmount(value: bigint, decimals: number, opts: { group?: boolean } = {}): string {
  const g = (w: string) => (opts.group ? w.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : w);
  if (decimals === 0) return g(value.toString());
  const s = value.toString().padStart(decimals + 1, '0');
  const whole = g(s.slice(0, -decimals));
  const frac = s.slice(-decimals).replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : whole;
}
