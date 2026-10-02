import type { KeyValueStore } from '@/application/ports';
import { signingKeyStorageKey } from './privateStateProvider';

const HEX64 = /^[0-9a-f]{64}$/;

const normalize = (a: string) => a.trim().replace(/^0x/, '').toLowerCase();

/**
 * The contract's maintenance authority key (created at deploy time, required to register circuits). It lives only
 * in this browser, so it needs an explicit backup path.
 */
export async function exportAuthorityKey(store: KeyValueStore, contractAddress: string): Promise<string | null> {
  const raw = await store.get(signingKeyStorageKey(normalize(contractAddress)));
  if (raw === null) return null;
  try {
    const v = JSON.parse(raw);
    return typeof v === 'string' ? v : null;
  } catch {
    return null;
  }
}

/** Restores an authority key for a contract; refuses anything that does not look like a 32-byte hex secret. */
export async function importAuthorityKey(store: KeyValueStore, contractAddress: string, key: string): Promise<void> {
  const k = normalize(key);
  if (!HEX64.test(k)) throw new Error('Authority key must be 64 hex characters.');
  const addr = normalize(contractAddress);
  if (!HEX64.test(addr)) throw new Error('Contract address must be 64 hex characters.');
  if (k === addr) throw new Error('That is the contract address, not the authority key.');
  const slot = signingKeyStorageKey(addr);
  const previous = await store.get(slot);
  if (previous && previous !== JSON.stringify(k)) await store.set(`${slot}:replaced:${Date.now()}`, previous); // never lose a key silently
  await store.set(slot, JSON.stringify(k));
}
