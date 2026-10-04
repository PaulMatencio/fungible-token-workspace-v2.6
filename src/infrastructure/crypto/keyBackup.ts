/**
 * Passphrase-protected key backup — same scheme as the signer-tool's encrypted key files:
 * scrypt (N=2^17, r=8, p=1, 32-byte key, passphrase NFKC-normalised) → AES-256-GCM, with the file's metadata bound as
 * additional authenticated data so it cannot be edited without invalidating the tag.
 *
 * The payload holds the app identity secret key and, optionally, the open contract's maintenance authority key.
 * Runs in the browser (Web Crypto + @noble/hashes scrypt) and in Node (tests).
 */
import { scryptAsync } from '@noble/hashes/scrypt.js';
import { bytesToHex, hexToBytes } from '@/domain/hex';

export const BACKUP_TYPE = 'fungible-token-key-backup';
export const MIN_PASSPHRASE = 12;
const SCRYPT = { N: 1 << 17, r: 8, p: 1 };
const HEX64 = /^[0-9a-f]{64}$/;

export interface BackupPayload {
  /** App identity secret key (64 hex) — the token account derives from it. */
  identitySecretKey: string;
  /** Maintenance authority key of one contract (64 hex), when this browser holds it. */
  authority?: { contractAddress: string; key: string };
}

export interface BackupMeta {
  app: 'fungible-token';
  createdAt: string;
  /** Token account the identity key derives to (informational; lets you recognise the file). */
  account?: string;
  /** Contract the authority key belongs to, if included. */
  contractAddress?: string;
}

export interface KeyBackupFile {
  type: typeof BACKUP_TYPE;
  version: 1;
  kdf: { name: 'scrypt'; salt: string; N: number; r: number; p: number };
  cipher: { name: 'aes-256-gcm'; iv: string; tag: string };
  meta: BackupMeta;
  ciphertext: string;
}

const rnd = (n: number) => globalThis.crypto.getRandomValues(new Uint8Array(n));
const aad = (meta: BackupMeta) => new TextEncoder().encode(JSON.stringify(meta));

async function deriveKey(passphrase: string, salt: Uint8Array, N: number, r: number, p: number): Promise<CryptoKey> {
  const raw = await scryptAsync(passphrase.normalize('NFKC'), salt, { N, r, p, dkLen: 32, maxmem: 256 * 1024 * 1024 });
  return globalThis.crypto.subtle.importKey('raw', raw as BufferSource, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function validatePayload(p: BackupPayload): void {
  if (!HEX64.test(p.identitySecretKey)) throw new Error('The identity secret key must be 64 hex characters.');
  if (p.authority && (!HEX64.test(p.authority.key) || !HEX64.test(p.authority.contractAddress))) {
    throw new Error('The authority key and contract address must be 64 hex characters.');
  }
}

export async function encryptKeyBackup(payload: BackupPayload, passphrase: string, account?: string): Promise<KeyBackupFile> {
  if (passphrase.length < MIN_PASSPHRASE) throw new Error(`Passphrase must be at least ${MIN_PASSPHRASE} characters.`);
  validatePayload(payload);
  const salt = rnd(16);
  const iv = rnd(12);
  const meta: BackupMeta = {
    app: 'fungible-token',
    createdAt: new Date().toISOString(),
    ...(account ? { account } : {}),
    ...(payload.authority ? { contractAddress: payload.authority.contractAddress } : {})
  };
  const key = await deriveKey(passphrase, salt, SCRYPT.N, SCRYPT.r, SCRYPT.p);
  const sealed = new Uint8Array(
    await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource, additionalData: aad(meta) as BufferSource }, key, new TextEncoder().encode(JSON.stringify(payload)))
  );
  // Web Crypto appends the 16-byte tag to the ciphertext; the file keeps them apart, like the signer-tool's key files.
  const ct = sealed.slice(0, sealed.length - 16);
  const tag = sealed.slice(sealed.length - 16);
  return {
    type: BACKUP_TYPE,
    version: 1,
    kdf: { name: 'scrypt', salt: bytesToHex(salt), ...SCRYPT },
    cipher: { name: 'aes-256-gcm', iv: bytesToHex(iv), tag: bytesToHex(tag) },
    meta,
    ciphertext: bytesToHex(ct)
  };
}

export function parseKeyBackup(text: string): KeyBackupFile {
  let f: KeyBackupFile;
  try {
    f = JSON.parse(text) as KeyBackupFile;
  } catch {
    throw new Error('This is not a key backup file (invalid JSON).');
  }
  if (f?.type !== BACKUP_TYPE || f.version !== 1 || f.kdf?.name !== 'scrypt' || f.cipher?.name !== 'aes-256-gcm' || !f.meta || typeof f.ciphertext !== 'string') {
    throw new Error('This is not a fungible-token key backup file.');
  }
  // Refuse absurd work factors from an untrusted file (memory/CPU denial) — ours is exactly N=2^17, r=8, p=1.
  if (f.kdf.N !== SCRYPT.N || f.kdf.r !== SCRYPT.r || f.kdf.p !== SCRYPT.p) throw new Error('Unsupported key-derivation parameters in this backup file.');
  return f;
}

export async function decryptKeyBackup(file: KeyBackupFile | string, passphrase: string): Promise<{ payload: BackupPayload; meta: BackupMeta }> {
  const f = typeof file === 'string' ? parseKeyBackup(file) : file;
  const key = await deriveKey(passphrase, hexToBytes(f.kdf.salt), f.kdf.N, f.kdf.r, f.kdf.p);
  const sealed = new Uint8Array([...hexToBytes(f.ciphertext), ...hexToBytes(f.cipher.tag)]);
  let pt: ArrayBuffer;
  try {
    pt = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv: hexToBytes(f.cipher.iv) as BufferSource, additionalData: aad(f.meta) as BufferSource }, key, sealed as BufferSource);
  } catch {
    throw new Error('Wrong passphrase, or the backup file was modified.');
  }
  const payload = JSON.parse(new TextDecoder().decode(pt)) as BackupPayload;
  validatePayload(payload);
  return { payload, meta: f.meta };
}

export function backupFileName(meta: BackupMeta): string {
  return `fungible-token-key-backup-${meta.createdAt.slice(0, 10)}.json`;
}
