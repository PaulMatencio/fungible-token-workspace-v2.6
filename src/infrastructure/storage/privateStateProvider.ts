import type { PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';
import type { KeyValueStore } from '@/application/ports';

/** Storage key of a contract's maintenance-authority (signing) key. Shared with the export/import helpers below. */
export const signingKeyStorageKey = (contractAddress: string) => `sk:${contractAddress}`;

const unsupported = async (): Promise<never> => {
  throw new Error('Export/import is not supported by this store');
};

/**
 * Persistent PrivateStateProvider on our KeyValueStore. FungibleToken has no
 * on-chain private state (PS = undefined), but the deploy flow still stores the
 * contract-maintenance signing key here — it must survive reloads.
 */
export function persistentPrivateStateProvider(store: KeyValueStore): PrivateStateProvider<string, unknown> {
  let address = 'default';
  const sKey = (id: string) => `ps:${address}:${id}`;
  const kKey = signingKeyStorageKey;
  return {
    setContractAddress: (a: string) => {
      address = a;
    },
    set: async (id, state) => store.set(sKey(id), JSON.stringify(state ?? null)),
    get: async (id) => {
      const raw = await store.get(sKey(id));
      return raw === null ? null : (JSON.parse(raw) as unknown);
    },
    remove: async (id) => store.remove(sKey(id)),
    clear: async () => {
      for (const k of await store.keys(`ps:${address}:`)) await store.remove(k);
    },
    setSigningKey: async (a, key) => store.set(kKey(a), JSON.stringify(key)),
    getSigningKey: async (a) => {
      const raw = await store.get(kKey(a));
      return raw ? (JSON.parse(raw) as string) : null;
    },
    removeSigningKey: async (a) => store.remove(kKey(a)),
    clearSigningKeys: async () => {
      for (const k of await store.keys('sk:')) await store.remove(k);
    },
    exportPrivateStates: unsupported,
    importPrivateStates: unsupported,
    exportSigningKeys: unsupported,
    importSigningKeys: unsupported
  } as PrivateStateProvider<string, unknown>;
}
