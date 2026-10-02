import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { Transaction } from '@midnight-ntwrk/ledger-v8';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { MidnightProvider, MidnightProviders, PrivateStateProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { MidnightBech32m, ShieldedCoinPublicKey, ShieldedEncryptionPublicKey } from '@midnight-ntwrk/wallet-sdk-address-format';
import type { KeyValueStore } from '@/application/ports';
import type { StepSink } from '@/application/deployProgress';
import { compactText, deepMessage } from '@/domain/errors';
import { networkConfig } from '../config/network';
import { ZK_ASSET_PATH } from '../contract/compiled';
import { persistentPrivateStateProvider } from '../storage/privateStateProvider';
import type { WalletSession } from './connector';

const HEX64 = /^[0-9a-fA-F]{64}$/;

/**
 * The DApp Connector returns shielded keys Bech32m-encoded (mn_shield-cpk_…),
 * but midnight-js / the ledger want raw hex — passing the Bech32m string is
 * what makes the constructor context fail ("Failed to configure constructor
 * context with coin public key"). Accepts either form.
 */
export function shieldedKeyToHex(value: string, kind: 'coin' | 'encryption', networkId: string): string {
  if (HEX64.test(value)) return value.toLowerCase();
  const parsed = MidnightBech32m.parse(value);
  return kind === 'coin'
    ? ShieldedCoinPublicKey.codec.decode(networkId, parsed).toHexString()
    : ShieldedEncryptionPublicKey.codec.decode(networkId, parsed).toHexString();
}

/** DApp Connector errors are plain objects; show "Rejected: reason" rather than raw JSON. */
function readable(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object') {
    const o = e as { type?: string; code?: string; reason?: string; message?: string };
    if (o.type === 'DAppConnectorAPIError') return `${o.code ?? 'Error'}${o.reason ? `: ${o.reason}` : ''}`;
    const parts = [...new Set(deepMessage(e))];
    return parts.length ? parts.join(' ← ') : compactText(JSON.stringify(e));
  }
  return String(e);
}

/** Fails fast, with an actionable message, when the local proof server isn't running. */
export async function assertProofServerReachable(url: string, timeoutMs = 4000): Promise<void> {
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/health`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    throw new Error(
      `Local proof server not reachable at ${url} (${e instanceof Error ? e.message : String(e)}). Start it (docker: midnightntwrk/proof-server:8.1.0, port 6300) or change "proofServer" in midnight.config.json.`
    );
  }
}

/** Re-throws with the failing step named and the raw error logged (wallets often say only "Request failed"). */
async function stage<T>(name: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[wallet] ${name} failed`, e);
    const detail = compactText(readable(e));
    throw new Error(`${detail} (during ${name})`, { cause: e });
  }
}

export type AppProviders = MidnightProviders<string, string, unknown>;

/**
 * Assembles midnight-js providers from a connected wallet. Endpoints come from
 * the wallet's own configuration (respects the user's network choice); the
 * proof server falls back to the configured local one.
 */
export async function createWalletProviders(session: WalletSession, store: KeyValueStore, sink?: StepSink): Promise<AppProviders> {
  const api: ConnectedAPI = session.api;
  const cfg = await api.getConfiguration();
  setNetworkId(cfg.networkId);

  const publicDataProvider = indexerPublicDataProvider(cfg.indexerUri, cfg.indexerWsUri);
  const zkConfigProvider = new FetchZkConfigProvider<string>(`${window.location.origin}${ZK_ASSET_PATH}`, fetch.bind(window));
  // Proving always uses the LOCAL proof server from midnight.config.json — never the wallet's hosted one
  // (cfg.proverServerUri). A proof request carries the circuit's private inputs (witnesses such as the token
  // secret key), which must not leave this machine; a shared remote prover also rejected this contract's circuits (HTTP 500).
  const baseProofProvider = httpClientProofProvider(networkConfig.proofServer, zkConfigProvider);
  // midnight-js order: build unproven tx → prove → balance → submit → confirm. Each wrapper reports its stage.
  const proofProvider: typeof baseProofProvider = {
    ...baseProofProvider,
    proveTx: async (...a: Parameters<typeof baseProofProvider.proveTx>) => {
      await assertProofServerReachable(networkConfig.proofServer);
      sink?.done('build');
      sink?.begin('prove');
      const r = await baseProofProvider.proveTx(...a);
      sink?.done('prove');
      return r;
    }
  };

  const keys = await api.getShieldedAddresses();
  const shieldedCoinPublicKey = shieldedKeyToHex(keys.shieldedCoinPublicKey, 'coin', cfg.networkId);
  const shieldedEncryptionPublicKey = shieldedKeyToHex(keys.shieldedEncryptionPublicKey, 'encryption', cfg.networkId);

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedEncryptionPublicKey,
    // The connected wallet selects DUST inputs and pays the fee (payFees: true).
    balanceTx: async (tx) => {
      sink?.begin('balance');
      const { tx: balancedHex } = await stage('wallet.balanceUnsealedTransaction', () =>
        api.balanceUnsealedTransaction(toHex(tx.serialize()), { payFees: true })
      );
      sink?.done('balance');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balancedHex));
    }
  };

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx) => {
      const id = tx.identifiers()[0];
      sink?.begin('submit');
      try {
        await stage('wallet.submitTransaction', () => api.submitTransaction(toHex(tx.serialize())));
      } catch (e) {
        // A node "temporarily banned" / "already imported" rejection usually means an earlier attempt is
        // still pending or was dropped: show what the wallet itself last saw.
        const hist = await api.getTxHistory(0, 5).catch(() => null);
        const recent = hist ? hist.map((h) => `${String(h.txHash).slice(0, 10)}…=${h.txStatus.status}`).join(', ') : 'unavailable';
        console.error('[wallet] submit failed; tx id', id, 'recent wallet history:', hist);
        throw new Error(`${e instanceof Error ? e.message : String(e)} [tx ${String(id).slice(0, 12)}…; wallet recent: ${recent}]`, { cause: e });
      }
      sink?.done('submit');
      sink?.begin('confirm');
      return id;
    }
  };

  const privateStateProvider: PrivateStateProvider<string, unknown> = persistentPrivateStateProvider(store);

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider
  };
}
