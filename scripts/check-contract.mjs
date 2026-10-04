#!/usr/bin/env node
/**
 * Read-only: asks the public preprod node for a contract's state and prints which circuits are registered.
 *   node scripts/check-contract.mjs <64-hex contract address> [--pubkeys <file|dir> ...]
 * Prints the token's metadata and multisig setup (the values the Deploy form needs) and, with --pubkeys, finds which
 * of YOUR cosigner public keys are registered. Public keys are not stored on-chain (only salted commitments), so they
 * are matched from files you point at: any .json containing {"x","y"} or {"publicKey":{"x","y"}} (e.g. approval files).
 * Uses only the node's `midnight_contractState` RPC (no wallet, no secrets, nothing is sent on-chain).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { ContractState as RtContractState } from '@midnight-ntwrk/compact-runtime';

const cfg = JSON.parse(readFileSync('midnight.config.json', 'utf8'));
const args = process.argv.slice(2);
const pk = args.indexOf('--pubkeys');
const pubkeyPaths = pk >= 0 ? args.splice(pk).slice(1) : [];
const address = (args[0] ?? '').replace(/^0x/, '').toLowerCase();
if (!/^[0-9a-f]{64}$/.test(address)) {
  console.error('usage: node scripts/check-contract.mjs <64-hex contract address> [--pubkeys <file|dir> ...]');
  process.exit(2);
}

const res = await fetch(cfg.nodeRpc, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'midnight_contractState', params: [address] })
});
const j = await res.json();
if (j.error || !j.result) {
  console.log(`NOT FOUND on ${cfg.networkId} (${cfg.nodeRpc}): ${JSON.stringify(j.error ?? j).slice(0, 200)}`);
  process.exit(1);
}

const state = ledger.ContractState.deserialize(Buffer.from(j.result.replace(/^0x/, ''), 'hex'));
const registered = new Set(state.operations().map((o) => (typeof o === 'string' ? o : new TextDecoder().decode(o))));
const dir = cfg.contract?.managedDir ?? 'contract/managed/fungible-token-v2.6';
const expected = readdirSync(`${dir}/keys`).filter((f) => f.endsWith('.verifier')).map((f) => f.replace('.verifier', '')).sort();
const missing = expected.filter((c) => !registered.has(c));

console.log(`Contract ${address}`);
console.log(`Network  : ${cfg.networkId} via ${cfg.nodeRpc}`);
console.log(`State    : found (${(j.result.length - 2) / 2} bytes)`);
console.log(`Registered (${registered.size}/${expected.length}): ${[...registered].sort().join(', ') || '—'}`);
console.log(missing.length ? `Missing    (${missing.length}): ${missing.join(', ')}` : 'All circuits registered.');


// ---------------------------------------------------------------------------------------------------------------
// Token metadata + multisig setup (what the Deploy form needs), and cosigner public-key matching.
// ---------------------------------------------------------------------------------------------------------------
const hex = (b) => Buffer.from(b).toString('hex');
const fmt = (v, d) => { const s = v.toString().padStart(d + 1, '0'); return d ? `${s.slice(0, -d)}.${s.slice(-d)}`.replace(/\.?0+$/, '') || '0' : s; };
const MAX128 = (1n << 128n) - 1n;
try {
  const { ledger: readLedger } = await import(pathToFileURL(resolve(dir, 'contract/index.js')).href);
  const L = readLedger(RtContractState.deserialize(Buffer.from(j.result.replace(/^0x/, ''), 'hex')).data);
  const dec = Number(L._decimals);
  const salt = hex(L._contractSalt);
  const commitments = [...L._multisigSigners].map(hex);
  console.log('\n--- Token ---');
  console.log(`Name          : ${L._name}`);
  console.log(`Symbol        : ${L._symbol}`);
  console.log(`Decimals      : ${dec}`);
  console.log(`Max supply    : ${L._maxSupply === MAX128 ? '0 (uncapped)' : fmt(L._maxSupply, dec)}   (${L._maxSupply} base units)`);
  console.log(`Total supply  : ${fmt(L._totalSupply, dec)}   (${L._totalSupply} base units)`);
  console.log(`Paused        : ${L._paused}`);
  console.log('\n--- Governance ---');
  console.log(`Owner (manager account): ${hex(L.owner)}`);
  if (L.treasury) console.log(`Treasury (wallet bytes): ${hex(L.treasury)}`);
  console.log(`Emergency pauser       : ${hex(L._emergencyPauser)}`);
  console.log(`Threshold              : ${L._multisigThreshold} of ${L._multisigSignerCount}`);
  console.log(`Nonce                  : ${L._multisigNonce}`);
  console.log(`Contract salt          : ${salt}`);
  console.log('Signer commitments     :');
  commitments.forEach((c) => console.log(`  ${c}`));

  // Match the user's public keys against the registered commitments.
  if (pubkeyPaths.length) {
    const tools = await import(pathToFileURL(resolve('contract/managed/signer-tools/contract/index.js')).href);
    const T = tools.pureCircuits;
    const found = new Map();
    const take = (o) => {
      if (!o || typeof o !== 'object') return;
      const x = o.x ?? o.X, y = o.y ?? o.Y;
      if (typeof x === 'string' && typeof y === 'string' && /^\d+$/.test(x) && /^\d+$/.test(y)) found.set(`${x}:${y}`, { x, y });
      for (const v of Object.values(o)) if (v && typeof v === 'object') take(v);
    };
    const visit = (p) => {
      const st = statSync(p);
      if (st.isDirectory()) return readdirSync(p).forEach((f) => visit(join(p, f)));
      if (!/\.json$|^public-key|\.txt$/i.test(p)) return;
      try { take(JSON.parse(readFileSync(p, 'utf8'))); } catch { /* not JSON */ }
    };
    pubkeyPaths.forEach((p) => { try { visit(resolve(p)); } catch (e) { console.log(`(skipped ${p}: ${e.message})`); } });
    const saltBytes = Uint8Array.from(Buffer.from(salt, 'hex'));
    const matched = new Map();
    for (const { x, y } of found.values()) {
      const c = hex(T.calculateSignerCommitment({ x: BigInt(x), y: BigInt(y) }, saltBytes));
      if (commitments.includes(c)) matched.set(c, { x, y });
    }
    console.log(`\n--- Cosigner public keys (${found.size} candidate key(s) found, ${matched.size} registered here) ---`);
    for (const c of commitments) {
      const m = matched.get(c);
      console.log(m ? `OK       ${c.slice(0, 16)}…  ${JSON.stringify(m)}` : `UNKNOWN  ${c.slice(0, 16)}…  (no public key file matches this commitment)`);
    }
    const ordered = commitments.map((c) => matched.get(c)).filter(Boolean);
    if (ordered.length === commitments.length) {
      console.log('\nDeploy form → "Cosigner public keys" (one per line):');
      ordered.forEach((m) => console.log(JSON.stringify(m)));
    }
  } else {
    console.log('\n(Add  --pubkeys <file|dir> ...  to match your cosigner public keys against these commitments.)');
  }
  console.log('\n--- Deploy form values to re-create this token ---');
  console.log(`Name: ${L._name} | Symbol: ${L._symbol} | Decimals: ${dec} | Max supply: ${L._maxSupply === MAX128 ? '0 (uncapped)' : fmt(L._maxSupply, dec)} | Threshold: ${L._multisigThreshold}${L.treasury ? ` | Treasury: ${hex(L.treasury)}` : ''}`);
} catch (e) {
  console.log(`\n(metadata unavailable: ${e.message} — is this a contract from this project's version?)`);
}
