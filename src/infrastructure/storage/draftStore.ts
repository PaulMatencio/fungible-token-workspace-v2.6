import type { KeyValueStore } from '@/application/ports';
import type { MultisigDraft } from '@/domain/multisig';

const slot = (contractAddress: string) => `multisig-draft:${contractAddress.toLowerCase()}`;

/** Persists the in-progress multisig operation (request + collected approvals) per contract. Contains no secrets. */
export class DraftStore {
  constructor(private readonly store: KeyValueStore) {}

  async load(contractAddress: string): Promise<MultisigDraft | null> {
    const raw = await this.store.get(slot(contractAddress));
    if (!raw) return null;
    try {
      const d = JSON.parse(raw) as MultisigDraft;
      return d && d.version === 1 && typeof d.type === 'string' && Array.isArray(d.approvals) ? d : null;
    } catch {
      return null; // corrupt entry: ignore rather than crash the UI
    }
  }

  async save(contractAddress: string, draft: Omit<MultisigDraft, 'version' | 'savedAt'>): Promise<void> {
    const d: MultisigDraft = { ...draft, version: 1, savedAt: Date.now() };
    await this.store.set(slot(contractAddress), JSON.stringify(d));
  }

  async clear(contractAddress: string): Promise<void> {
    await this.store.remove(slot(contractAddress));
  }
}
