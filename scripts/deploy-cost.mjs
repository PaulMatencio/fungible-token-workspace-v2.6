#!/usr/bin/env node
/**
 * Estimates the on-chain cost of deploying the contract without any network:
 * builds the real deploy transaction, mock-proves it, and normalises its cost
 * against the ledger's block limits (fullness > 1 means "exhausts the block").
 *   node scripts/deploy-cost.mjs [--circuits a,b,c]   (subset of verifier keys)
 */
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTxFromVerifierKeys } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

const cfg = JSON.parse(readFileSync('midnight.config.json', 'utf8'));
const mi = process.argv.indexOf('--managed');
const dir = path.resolve(mi >= 0 ? process.argv[mi + 1] : (cfg.contract?.managedDir ?? 'contract/managed/fungible-token-v2.6'));
const native = dir.includes('native');
const { Contract } = await import(path.join(dir, 'contract/index.js'));
setNetworkId(cfg.networkId ?? 'preprod');

const only = process.argv.includes('--circuits') ? process.argv[process.argv.indexOf('--circuits') + 1].split(',') : null;
const all = readdirSync(path.join(dir, 'keys')).filter((f) => f.endsWith('.verifier')).map((f) => f.replace('.verifier', ''));
const ids = only ?? all;

// Minimal ZKConfigProvider (midnight-js calls getVerifierKey per circuit).
const vk = (id) => new Uint8Array(readFileSync(path.join(dir, 'keys', `${id}.verifier`)));
const zk = {
  getZKIR: async (id) => new Uint8Array(readFileSync(path.join(dir, 'zkir', `${id}.bzkir`))),
  getProverKey: async (id) => new Uint8Array(readFileSync(path.join(dir, 'keys', `${id}.prover`))),
  getVerifierKey: async (id) => vk(id),
  getVerifierKeys: async (circuitIds) => circuitIds.filter((c) => ids.includes(c)).map((id) => [id, vk(id)]),
  get: async (id) => ({ circuitId: id, verifierKey: vk(id) }),
};

const z = new Uint8Array(32);
const witnesses = { localSecretKey: (c) => [c.privateState, z], getSchnorrReduction: (c) => [c.privateState, [0n, 0n]] };
// midnight-js asks the Contract for its provable circuit ids; exposing only a subset makes the
// deploy transaction carry only those verifier keys (the rest can be inserted afterwards).
class Subset extends Contract {
  constructor(w) {
    super(w);
    const keep = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => ids.includes(k)));
    this.provableCircuits = keep(this.provableCircuits);
    this.impureCircuits = keep(this.impureCircuits);
  }
}
const compiled = CompiledContract.make('fungible-token', only ? Subset : Contract).pipe(CompiledContract.withWitnesses(witnesses), CompiledContract.withCompiledFileAssets(dir));

const coinPk = '00'.repeat(32);
const encPk = '11'.repeat(32);
const signers = [1, 2, 3].map((n) => new Uint8Array(32).fill(n));
const args = [z, z, 'Midnight Token', 'MDT', 6n, 0n, signers, 2n];
const unproven = await createUnprovenDeployTxFromVerifierKeys(
  zk, coinPk,
  { compiledContract: compiled, args },
  encPk
);
const tx = unproven.private ? unproven : unproven;
const unprovenTx = tx.private.unprovenTx ?? tx.public.unprovenTx ?? Object.values({ ...tx.public, ...tx.private }).find((v) => v && typeof v.mockProve === 'function');
console.log("public keys:", Object.keys(tx.public), "private keys:", Object.keys(tx.private));
const params = ledger.LedgerParameters.initialParameters();
const t = unprovenTx.mockProve ? unprovenTx.mockProve() : unprovenTx;
const sz = t.serialize().length;
const cost = t.cost(params);
const show = (o) => JSON.stringify(o, (k, v) => (typeof v === 'bigint' ? v.toString() : v));
console.log(`circuits in deploy: ${ids.length} -> ${ids.join(',')}`);
console.log('serialized size (bytes):', sz);
console.log('cost:', show(cost));
console.log('fullness vs block limits:', show(params.normalizeFullness(cost)), '(>1 on any axis = exceeds one block)');
