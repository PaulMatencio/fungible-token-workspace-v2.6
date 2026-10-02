import type { KeyValueStore } from '@/application/ports';
import { bytesToHex, hex32ToBytes } from '@/domain/hex';
import { generateSecretKey } from '../crypto/identity';

const SK_KEY = 'identity:secretKey';
const SIGNER_PK_KEY = 'identity:signerPubkey';
const DEPLOYMENT_KEY = 'deployment:current';

export interface StoredDeployment {
  contractAddress: string;
  txHash?: string;
  deployedAt: number;
  networkId: string;
}

/**
 * Holds the app-level token identity. The contract's `authenticate()` needs a
 * 32-byte secret that wallets do not expose, so the app keeps its own,
 * persisted locally with explicit export/import for backup.
 */
export class IdentityStore {
  constructor(private readonly store: KeyValueStore) {}

  async getOrCreateSecretKey(): Promise<Uint8Array> {
    const existing = await this.store.get(SK_KEY);
    if (existing) return hex32ToBytes(existing, 'stored key');
    const sk = generateSecretKey();
    await this.store.set(SK_KEY, bytesToHex(sk));
    return sk;
  }
  async hasSecretKey() {
    return (await this.store.get(SK_KEY)) !== null;
  }
  /** Replaces the secret key, first keeping the previous one under a timestamped backup entry (never silently lose a key). */
  async importSecretKey(hex: string): Promise<Uint8Array> {
    const sk = hex32ToBytes(hex, 'secret key');
    const previous = await this.store.get(SK_KEY);
    if (previous && previous !== bytesToHex(sk)) await this.store.set(`${SK_KEY}:replaced:${Date.now()}`, previous);
    await this.store.set(SK_KEY, bytesToHex(sk));
    return sk;
  }
  async exportSecretKey(): Promise<string> {
    return bytesToHex(await this.getOrCreateSecretKey());
  }

  /** Public signer key ({x,y} decimal) a cosigner registers to be recognised as a cosigner. */
  async getSignerPubkey(): Promise<{ x: string; y: string } | null> {
    const raw = await this.store.get(SIGNER_PK_KEY);
    return raw ? (JSON.parse(raw) as { x: string; y: string }) : null;
  }
  async setSignerPubkey(p: { x: string; y: string } | null) {
    if (p) await this.store.set(SIGNER_PK_KEY, JSON.stringify(p));
    else await this.store.remove(SIGNER_PK_KEY);
  }

  async getDeployment(): Promise<StoredDeployment | null> {
    const raw = await this.store.get(DEPLOYMENT_KEY);
    return raw ? (JSON.parse(raw) as StoredDeployment) : null;
  }
  async setDeployment(d: StoredDeployment | null) {
    if (d) await this.store.set(DEPLOYMENT_KEY, JSON.stringify(d));
    else await this.store.remove(DEPLOYMENT_KEY);
  }
}
