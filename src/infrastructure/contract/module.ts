/**
 * Single import point for compiler output. When the contract is recompiled to
 * another directory (see midnight.config.json), only this file changes.
 */
export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type Witnesses,
  type SchnorrSignature
} from '@contract/managed/fungible-token-v2.6/contract/index.js';
export { pureCircuits as signerTools } from '@contract/managed/signer-tools/contract/index.js';
