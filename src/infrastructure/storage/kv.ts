import type { KeyValueStore } from '@/application/ports';

/** In-memory store; used on the server, in tests, and as a fallback when storage is blocked. */
export class MemoryStore implements KeyValueStore {
  private m = new Map<string, string>();
  async get(k: string) {
    return this.m.get(k) ?? null;
  }
  async set(k: string, v: string) {
    this.m.set(k, v);
  }
  async remove(k: string) {
    this.m.delete(k);
  }
  async keys(prefix: string) {
    return [...this.m.keys()].filter((k) => k.startsWith(prefix));
  }
}

/** localStorage-backed store (persists across reloads). Falls back to memory when unavailable. */
export class LocalStorageStore implements KeyValueStore {
  private fallback = new MemoryStore();
  constructor(private readonly ns: string) {}

  private get ls(): Storage | null {
    try {
      return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      return null;
    }
  }
  private k = (key: string) => `${this.ns}:${key}`;

  async get(key: string) {
    return this.ls ? this.ls.getItem(this.k(key)) : this.fallback.get(key);
  }
  async set(key: string, value: string) {
    if (this.ls) this.ls.setItem(this.k(key), value);
    else await this.fallback.set(key, value);
  }
  async remove(key: string) {
    if (this.ls) this.ls.removeItem(this.k(key));
    else await this.fallback.remove(key);
  }
  async keys(prefix: string) {
    if (!this.ls) return this.fallback.keys(prefix);
    const out: string[] = [];
    const p = this.k(prefix);
    for (let i = 0; i < this.ls.length; i++) {
      const key = this.ls.key(i);
      if (key?.startsWith(p)) out.push(key.slice(this.ns.length + 1));
    }
    return out;
  }
}
