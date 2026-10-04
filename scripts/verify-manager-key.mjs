#!/usr/bin/env node
/**
 * Read-only: checks that a secret key IS the manager (owner) of a contract, without any wallet or transaction.
 *   SK=<64-hex secret key> node scripts/verify-manager-key.mjs <64-hex contract address>
 *   node scripts/verify-manager-key.mjs <contract address>      (prompts for the key, hidden)
 * It reads the contract's public state from the node (salt + owner), derives
 *   account = persistentHash([pad(32,"fungible-token:auth"), salt, secretKey])
 * (the contract's `authenticate()` formula) and compares it with the on-chain owner. The key never leaves this process.
 */
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import readline from 'node:readline';
import { CompactTypeBytes, CompactTypeVector, ContractState, persistentHash } from '@midnight-ntwrk/compact-runtime';

const cfg = JSON.parse(readFileSync('midnight.config.json', 'utf8'));
const address = (process.argv[2] ?? '').replace(/^0x/, '').toLowerCase();
if (!/^[0-9a-f]{64}$/.test(address)) {
  console.error('usage: node scripts/verify-manager-key.mjs <64-hex contract address>   (key via SK=… or prompt)');
  process.exit(2);
}

async function readKey() {
  if (process.env.SK) return process.env.SK.trim();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  rl._writeToOutput = (s) => { if (s.includes('\n') || s.startsWith('Secret key')) rl.output.write(s); };
  return new Promise((ok) => rl.question('Secret key (64 hex, hidden): ', (a) => { rl.close(); console.log(); ok(a.trim()); }));
}
const skHex = (await readKey()).replace(/^0x/, '').toLowerCase();
if (!/^[0-9a-f]{64}$/.test(skHex)) { console.error('The secret key must be 64 hex characters'); process.exit(2); }

const dir = cfg.contract?.managedDir ?? 'contract/managed/fungible-token-v2.6';
const { ledger } = await import(pathToFileURL(resolve(dir, 'contract/index.js')).href);

const res = await fetch(cfg.nodeRpc, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'midnight_contractState', params: [address] })
});
const j = await res.json();
if (!j.result) { console.error(`Contract not found on ${cfg.networkId}: ${JSON.stringify(j.error ?? j).slice(0, 200)}`); process.exit(1); }

const l = ledger(ContractState.deserialize(Buffer.from(j.result.replace(/^0x/, ''), 'hex')).data);
const toHex = (b) => Buffer.from(b).toString('hex');
const pad32 = (s) => { const o = new Uint8Array(32); o.set(new TextEncoder().encode(s)); return o; };
const sk = Uint8Array.from(skHex.match(/../g).map((h) => parseInt(h, 16)));
const derived = toHex(persistentHash(new CompactTypeVector(3, new CompactTypeBytes(32)), [pad32('fungible-token:auth'), l._contractSalt, sk]));
const owner = toHex(l.owner);
const short = (h) => `${h.slice(0, 8)}…${h.slice(-6)}`;

console.log(`Contract            : ${address}`);
console.log(`On-chain owner      : ${short(owner)}`);
console.log(`Derived from the key: ${short(derived)}`);
console.log(derived === owner ? 'MATCH — this secret key IS the manager of the contract.' : 'NO MATCH — this key is not the manager of this contract.');
process.exit(derived === owner ? 0 : 1);
