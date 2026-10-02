import type { KeyValueStore, TxLogEntry } from '@/application/ports';

const PREFIX = 'tx:';
const MAX_ENTRIES = 200;

/** Persistent transaction history (survives reloads). Newest first. */
export class TxLog {
  constructor(private readonly store: KeyValueStore) {}

  async add(entry: TxLogEntry): Promise<void> {
    await this.store.set(`${PREFIX}${entry.id}`, JSON.stringify(entry));
    const all = await this.list();
    for (const old of all.slice(MAX_ENTRIES)) await this.store.remove(`${PREFIX}${old.id}`);
  }

  async list(contractAddress?: string): Promise<TxLogEntry[]> {
    const keys = await this.store.keys(PREFIX);
    const rows: TxLogEntry[] = [];
    for (const k of keys) {
      const raw = await this.store.get(k);
      if (!raw) continue;
      try {
        const e = JSON.parse(raw) as TxLogEntry;
        if (!contractAddress || e.contractAddress === contractAddress) rows.push(e);
      } catch {
        /* skip corrupt row */
      }
    }
    return rows.sort((a, b) => b.at - a.at);
  }

  async clear(): Promise<void> {
    for (const k of await this.store.keys(PREFIX)) await this.store.remove(k);
  }
}
