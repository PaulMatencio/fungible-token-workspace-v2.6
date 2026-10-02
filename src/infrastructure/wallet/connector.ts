/**
 * Reusable Midnight wallet connector (Lace, 1AM, any CAIP-372 wallet).
 *
 * Framework-free and free of imports from the rest of this app — copy this
 * folder into another project as-is. The only dependency is the
 * `@midnight-ntwrk/dapp-connector-api` types.
 */
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';

export type WalletErrorCode = 'NOT_FOUND' | 'REJECTED' | 'DISCONNECTED' | 'NETWORK_MISMATCH' | 'UNKNOWN';

export class WalletError extends Error {
  constructor(
    public readonly code: WalletErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

export interface KnownWallet {
  id: 'lace' | '1am';
  label: string;
  installUrl: string;
  /** Matched case-insensitively against the injected key, `name` and `rdns`. */
  match: string[];
}

export const KNOWN_WALLETS: readonly KnownWallet[] = [
  {
    id: 'lace',
    label: 'Lace',
    installUrl: 'https://chromewebstore.google.com/search/lace%20wallet',
    match: ['lace', 'mnlace']
  },
  { id: '1am', label: '1AM', installUrl: 'https://1am.xyz', match: ['1am'] }
];

export interface DetectedWallet {
  /** Key under `window.midnight`. */
  key: string;
  name: string;
  rdns: string;
  icon: string;
  apiVersion: string;
  known?: KnownWallet['id'];
}

type Injected = Record<string, InitialAPI | undefined>;

const injected = (): Injected => {
  if (typeof window === 'undefined') return {};
  return ((window as unknown as { midnight?: Injected }).midnight ?? {}) as Injected;
};

const isInitialApi = (w: unknown): w is InitialAPI => !!w && typeof (w as InitialAPI).connect === 'function';

function classify(key: string, w: InitialAPI): KnownWallet['id'] | undefined {
  const hay = `${key} ${w.name} ${w.rdns}`.toLowerCase();
  return KNOWN_WALLETS.find((k) => k.match.some((m) => hay.includes(m)))?.id;
}

/** Enumerates every injected Midnight wallet; never assumes a fixed key. */
export function detectWallets(): DetectedWallet[] {
  return Object.entries(injected())
    .filter((e): e is [string, InitialAPI] => isInitialApi(e[1]))
    .map(([key, w]) => ({
      key,
      name: w.name,
      rdns: w.rdns,
      icon: w.icon,
      apiVersion: w.apiVersion,
      known: classify(key, w)
    }));
}

/** Extension injection can lag page load; resolves once any wallet appears or on timeout. */
export function waitForWallets(timeoutMs = 2500): Promise<DetectedWallet[]> {
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      const found = detectWallets();
      if (found.length > 0 || Date.now() - start >= timeoutMs) return resolve(found);
      setTimeout(tick, 150);
    };
    tick();
  });
}

function describe(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  try {
    return JSON.stringify(e, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
  } catch {
    return String(e);
  }
}

/** Per-step limits. `connect` waits on a human (permission popup), so it gets longer. */
export const STEP_TIMEOUT_MS = { connect: 120_000, default: 20_000 } as const;

const TIMEOUT_HELP =
  'The wallet did not answer. Wallet extensions need their own node connection to respond; if the extension console shows ' +
  '"disconnected … 1006 Abnormal Closure", its network link is failing (VPN, firewall, ad-blocker or a temporary outage). ' +
  'Open the wallet, check it is synced on the right network, then retry.';

/** Runs one wallet call, tags any failure with the step name, and never waits forever. */
async function step<T>(name: string, fn: () => Promise<T>, timeoutMs: number = STEP_TIMEOUT_MS.default): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new WalletError('DISCONNECTED', `No response from the wallet after ${Math.round(timeoutMs / 1000)}s. ${TIMEOUT_HELP}`)),
          timeoutMs
        );
      })
    ]);
  } catch (e) {
    console.error(`[wallet-connector] ${name} failed`, e);
    const w = toWalletError(e);
    throw new WalletError(w.code, `${w.message} (during ${name})`, e);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function toWalletError(e: unknown): WalletError {
  if (e instanceof WalletError) return e;
  if (typeof e === 'object' && e !== null && (e as { type?: string }).type === 'DAppConnectorAPIError') {
    const { code, reason } = e as { code: string; reason?: string };
    const map: Record<string, WalletErrorCode> = {
      PermissionRejected: 'REJECTED',
      Rejected: 'REJECTED',
      Disconnected: 'DISCONNECTED'
    };
    return new WalletError(map[code] ?? 'UNKNOWN', reason || code, e);
  }
  return new WalletError('UNKNOWN', describe(e), e);
}

export interface WalletSession {
  wallet: DetectedWallet;
  api: ConnectedAPI;
  networkId: string;
  shieldedAddress?: string;
  unshieldedAddress?: string;
  coinPublicKey?: string;
  encryptionPublicKey?: string;
}

export type ConnectorState =
  | { status: 'idle' }
  | { status: 'connecting'; walletKey: string }
  | { status: 'connected'; session: WalletSession }
  | { status: 'error'; error: WalletError };

const LAST_WALLET_KEY = 'midnight-connector:last-wallet';

/**
 * Observable connector. `disconnect()` drops the session and clears the
 * auto-reconnect hint (the connector API itself has no disconnect call).
 */
export class WalletConnector {
  private state: ConnectorState = { status: 'idle' };
  private listeners = new Set<(s: ConnectorState) => void>();
  /** Bumped by connect()/disconnect(); a result that arrives for an older attempt is discarded. */
  private attempt = 0;

  constructor(private readonly networkId: string) {}

  getState = (): ConnectorState => this.state;

  subscribe = (fn: (s: ConnectorState) => void): (() => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private set(s: ConnectorState) {
    this.state = s;
    this.listeners.forEach((l) => l(s));
  }

  async connect(walletKey: string): Promise<WalletSession> {
    const entry = injected()[walletKey];
    if (!isInitialApi(entry)) {
      const err = new WalletError('NOT_FOUND', 'Wallet extension not found. Install it and reload the page.');
      this.set({ status: 'error', error: err });
      throw err;
    }
    const attempt = ++this.attempt;
    this.set({ status: 'connecting', walletKey });
    try {
      const api = await step(`connect("${this.networkId}")`, () => entry.connect(this.networkId), STEP_TIMEOUT_MS.connect);
      if (attempt !== this.attempt) throw new WalletError('DISCONNECTED', 'Connection cancelled');
      const status = await step('getConnectionStatus', () => api.getConnectionStatus());
      if (status.status !== 'connected') throw new WalletError('DISCONNECTED', 'Wallet reports it is not connected');
      if (status.networkId !== this.networkId) {
        throw new WalletError('NETWORK_MISMATCH', `Wallet is on "${status.networkId}", expected "${this.networkId}"`);
      }
      const session: WalletSession = {
        wallet: { key: walletKey, name: entry.name, rdns: entry.rdns, icon: entry.icon, apiVersion: entry.apiVersion, known: classify(walletKey, entry) },
        api,
        networkId: this.networkId
      };
      // Best-effort address lookups: a wallet may gate individual methods.
      await step('hintUsage', () => api.hintUsage?.(['getShieldedAddresses', 'getUnshieldedAddress', 'balanceUnsealedTransaction', 'submitTransaction']) ?? Promise.resolve()).catch(() => {});
      const sh = await step('getShieldedAddresses', () => api.getShieldedAddresses()).catch(() => undefined);
      const un = await step('getUnshieldedAddress', () => api.getUnshieldedAddress()).catch(() => undefined);
      session.shieldedAddress = sh?.shieldedAddress;
      session.coinPublicKey = sh?.shieldedCoinPublicKey;
      session.encryptionPublicKey = sh?.shieldedEncryptionPublicKey;
      session.unshieldedAddress = un?.unshieldedAddress;
      try {
        localStorage.setItem(LAST_WALLET_KEY, walletKey);
      } catch {
        /* storage blocked */
      }
      if (attempt !== this.attempt) throw new WalletError('DISCONNECTED', 'Connection cancelled');
      this.set({ status: 'connected', session });
      return session;
    } catch (e) {
      const err = toWalletError(e);
      if (attempt === this.attempt) this.set({ status: 'error', error: err });
      throw err;
    }
  }

  /** Also cancels an attempt that is still waiting on the wallet. */
  disconnect(): void {
    this.attempt++;
    try {
      localStorage.removeItem(LAST_WALLET_KEY);
    } catch {
      /* storage blocked */
    }
    this.set({ status: 'idle' });
  }

  /** Silent reconnect to the previously used wallet; resolves null when none/refused. */
  async tryAutoReconnect(): Promise<WalletSession | null> {
    let key: string | null = null;
    try {
      key = localStorage.getItem(LAST_WALLET_KEY);
    } catch {
      /* storage blocked */
    }
    if (!key) return null;
    await waitForWallets();
    try {
      return await this.connect(key);
    } catch {
      return null;
    }
  }
}
