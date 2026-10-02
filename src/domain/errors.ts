export type AppErrorCode =
  | 'WALLET_NOT_FOUND'
  | 'WALLET_REJECTED'
  | 'WALLET_DISCONNECTED'
  | 'NETWORK_MISMATCH'
  | 'VALIDATION'
  | 'CONTRACT_REJECTED'
  | 'CONTRACT_VERSION'
  | 'NOT_CONNECTED'
  | 'TOOLING'
  | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = 'AppError';
  }
}

const MAX_LEN = 700;

/**
 * Wallet / node errors often embed the whole serialized transaction as a byte map
 * (`{"0":109,"1":105,…}`). Collapse those, then cap the length, so the real reason stays visible.
 */
export function compactText(s: string): string {
  const out = s.replace(/\{\s*(?:"\d+"\s*:\s*\d+\s*,?\s*){16,}\}/g, (m) => `<${(m.match(/"\d+"/g) ?? []).length} bytes>`);
  return out.length > MAX_LEN ? `${out.slice(0, MAX_LEN)}… [truncated ${out.length - MAX_LEN} chars]` : out;
}

/** Collects every human-readable `message`/`reason`/`_tag` along an (Effect-style) error tree, skipping payload fields. */
export function deepMessage(e: unknown, depth = 0): string[] {
  if (depth > 8 || e === null || e === undefined) return [];
  if (typeof e === 'string') return [e];
  if (e instanceof Error) return [e.message, ...deepMessage((e as { cause?: unknown }).cause, depth + 1)];
  if (typeof e !== 'object') return [String(e)];
  const o = e as Record<string, unknown>;
  const own = [o.message, o.reason].filter((x): x is string => typeof x === 'string');
  const kids = ['failure', 'cause', 'error', 'defect'].flatMap((k) => deepMessage(o[k], depth + 1));
  const tag = typeof o._tag === 'string' && own.length === 0 && kids.length === 0 ? [o._tag] : [];
  return [...own, ...kids, ...tag];
}

/** Extracts the contract's assert message ("FungibleToken: …") when present. */
export function friendlyMessage(e: unknown): string {
  if (e instanceof AppError) return compactText(e.message);
  if (typeof e === 'object' && e !== null) {
    const anyE = e as { type?: string; code?: string; reason?: string; message?: string };
    if (anyE.type === 'DAppConnectorAPIError') return `${anyE.code ?? 'Error'}: ${anyE.reason ?? ''}`.trim();
    const msg = compactText(anyE.message ?? String(e));
    const m = /FungibleToken: [^\n"']+/.exec(msg);
    return m ? m[0] : msg;
  }
  return String(e);
}
