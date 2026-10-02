#!/usr/bin/env node
/**
 * Read-only: asks the public preprod node for a contract's state and prints which circuits are registered.
 *   node scripts/check-contract.mjs <64-hex contract address>
 * Uses only the node's `midnight_contractState` RPC (no wallet, no secrets, nothing is sent on-chain).
 */
import { readFileSync, readdirSync } from 'node:fs';
import * as ledger from '@midnight-ntwrk/ledger-v8';

const cfg = JSON.parse(readFileSync('midnight.config.json', 'utf8'));
const address = (process.argv[2] ?? '').replace(/^0x/, '').toLowerCase();
if (!/^[0-9a-f]{64}$/.test(address)) {
  console.error('usage: node scripts/check-contract.mjs <64-hex contract address>');
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
