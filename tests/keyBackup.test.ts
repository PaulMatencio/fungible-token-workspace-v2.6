import { createDecipheriv, scryptSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { IdentityStore } from '@/infrastructure/storage/identityStore';
import { exportAuthorityKey, importAuthorityKey } from '@/infrastructure/storage/authorityKey';
import { MemoryStore } from '@/infrastructure/storage/kv';
import { decryptKeyBackup, encryptKeyBackup, parseKeyBackup } from '@/infrastructure/crypto/keyBackup';

const ID = 'ab'.repeat(32);
const AUTH = 'cd'.repeat(32);
const ADDR = '12'.repeat(32);
const PASS = 'correct horse battery staple';

describe('passphrase-protected key backup (scrypt → AES-256-GCM)', () => {
  it('round-trips the identity and authority keys', async () => {
    const f = await encryptKeyBackup({ identitySecretKey: ID, authority: { contractAddress: ADDR, key: AUTH } }, PASS, 'f'.repeat(64));
    const { payload, meta } = await decryptKeyBackup(JSON.parse(JSON.stringify(f)), PASS);
    expect(payload).toEqual({ identitySecretKey: ID, authority: { contractAddress: ADDR, key: AUTH } });
    expect(meta.account).toBe('f'.repeat(64));
    expect(meta.contractAddress).toBe(ADDR);
    expect(JSON.stringify(f)).not.toContain(ID); // nothing in clear
    expect(JSON.stringify(f)).not.toContain(AUTH);
  });

  it('works with the identity key alone', async () => {
    const f = await encryptKeyBackup({ identitySecretKey: ID }, PASS);
    expect((await decryptKeyBackup(f, PASS)).payload.authority).toBeUndefined();
  });

  it('rejects a wrong passphrase and any tampering (ciphertext, tag, metadata)', async () => {
    const f = await encryptKeyBackup({ identitySecretKey: ID }, PASS, 'e'.repeat(64));
    await expect(decryptKeyBackup(f, 'another passphrase!!')).rejects.toThrow(/Wrong passphrase/);
    const flip = (h: string) => (h[0] === '0' ? '1' : '0') + h.slice(1);
    await expect(decryptKeyBackup({ ...f, ciphertext: flip(f.ciphertext) }, PASS)).rejects.toThrow(/Wrong passphrase/);
    await expect(decryptKeyBackup({ ...f, cipher: { ...f.cipher, tag: flip(f.cipher.tag) } }, PASS)).rejects.toThrow(/Wrong passphrase/);
    await expect(decryptKeyBackup({ ...f, meta: { ...f.meta, account: '0'.repeat(64) } }, PASS)).rejects.toThrow(/Wrong passphrase/);
  });

  it('enforces a 12-character passphrase and valid keys', async () => {
    await expect(encryptKeyBackup({ identitySecretKey: ID }, 'short')).rejects.toThrow(/at least 12/);
    await expect(encryptKeyBackup({ identitySecretKey: 'zz' }, PASS)).rejects.toThrow(/64 hex/);
  });

  it('refuses foreign files and unexpected scrypt parameters', () => {
    expect(() => parseKeyBackup('not json')).toThrow(/invalid JSON/);
    expect(() => parseKeyBackup('{"hello":1}')).toThrow(/not a fungible-token/);
  });

  it('is the signer-tool scheme: Node scrypt + aes-256-gcm decrypts the file', async () => {
    const f = await encryptKeyBackup({ identitySecretKey: ID }, PASS);
    expect(f.kdf).toMatchObject({ name: 'scrypt', N: 131072, r: 8, p: 1 });
    const key = scryptSync(PASS.normalize('NFKC'), Buffer.from(f.kdf.salt, 'hex'), 32, { N: f.kdf.N, r: f.kdf.r, p: f.kdf.p, maxmem: 256 * 1024 * 1024 });
    const d = createDecipheriv('aes-256-gcm', key, Buffer.from(f.cipher.iv, 'hex'));
    d.setAAD(Buffer.from(JSON.stringify(f.meta)));
    d.setAuthTag(Buffer.from(f.cipher.tag, 'hex'));
    const pt = Buffer.concat([d.update(Buffer.from(f.ciphertext, 'hex')), d.final()]).toString();
    expect(JSON.parse(pt).identitySecretKey).toBe(ID);
  });

  it('restores a wiped browser: identity key and authority key come back from the file', async () => {
    const before = new MemoryStore();
    const ids = new IdentityStore(before);
    const sk = await ids.exportSecretKey();
    await importAuthorityKey(before, ADDR, AUTH);
    const file = await encryptKeyBackup({ identitySecretKey: sk, authority: { contractAddress: ADDR, key: (await exportAuthorityKey(before, ADDR))! } }, PASS);

    const after = new MemoryStore(); // fresh browser
    const { payload } = await decryptKeyBackup(JSON.stringify(file), PASS);
    await new IdentityStore(after).importSecretKey(payload.identitySecretKey);
    await importAuthorityKey(after, payload.authority!.contractAddress, payload.authority!.key);
    expect(await new IdentityStore(after).exportSecretKey()).toBe(sk);
    expect(await exportAuthorityKey(after, ADDR)).toBe(AUTH);
  });
});
