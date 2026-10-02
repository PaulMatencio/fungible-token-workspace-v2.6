import type { Witnesses } from './module';

const TWO_248 = 1n << 248n;

/**
 * Witness bundle for FungibleToken v2.6. The contract has no on-chain private
 * state (PS = undefined). `getSecretKey` is a thunk so the key never lives in
 * long-lived module state and callers can swap identities between calls.
 */
export function createWitnesses(getSecretKey: () => Uint8Array): Witnesses<undefined> {
  return {
    localSecretKey: (ctx) => [ctx.privateState, getSecretKey()],
    getSchnorrReduction: (ctx, challengeHash) => [ctx.privateState, [challengeHash / TWO_248, challengeHash % TWO_248]]
  };
}
