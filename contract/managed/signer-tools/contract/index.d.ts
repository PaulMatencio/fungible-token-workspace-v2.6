import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
}

export type ProvableCircuits<PS> = {
}

export type PureCircuits = {
  derivePublicKey(sk_0: bigint): __compactRuntime.JubjubPoint;
  calculateSignerCommitment(pk_0: __compactRuntime.JubjubPoint,
                            salt_0: Uint8Array): Uint8Array;
  schnorrChallenge(announcement_0: __compactRuntime.JubjubPoint,
                   pk_0: __compactRuntime.JubjubPoint,
                   msgHash_0: Uint8Array): bigint;
  schnorrEquationHolds(announcement_0: __compactRuntime.JubjubPoint,
                       response_0: bigint,
                       pk_0: __compactRuntime.JubjubPoint,
                       c_0: bigint): boolean;
  mintDigest(contractAddress_0: Uint8Array,
             nonce_0: bigint,
             to_0: Uint8Array,
             value_0: bigint): Uint8Array;
  burnDigest(contractAddress_0: Uint8Array,
             nonce_0: bigint,
             account_0: Uint8Array,
             value_0: bigint): Uint8Array;
  setEmergencyPauserDigest(contractAddress_0: Uint8Array,
                           nonce_0: bigint,
                           newPauser_0: Uint8Array): Uint8Array;
  adminReallocateDigest(contractAddress_0: Uint8Array,
                        nonce_0: bigint,
                        trappedAccount_0: Uint8Array,
                        targetSpendableAccount_0: Uint8Array,
                        amount_0: bigint): Uint8Array;
  rotateSignerDigest(contractAddress_0: Uint8Array,
                     nonce_0: bigint,
                     oldSignerCommitment_0: Uint8Array,
                     newSignerPubkey_0: __compactRuntime.JubjubPoint,
                     contractSalt_0: Uint8Array): Uint8Array;
  burnDigestV3(contractAddress_0: Uint8Array, nonce_0: bigint, value_0: bigint): Uint8Array;
  withdrawDigest(contractAddress_0: Uint8Array,
                 nonce_0: bigint,
                 to_0: Uint8Array,
                 value_0: bigint): Uint8Array;
  rotatePopDigest(msgHash_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  derivePublicKey(context: __compactRuntime.CircuitContext<PS>, sk_0: bigint): __compactRuntime.CircuitResults<PS, __compactRuntime.JubjubPoint>;
  calculateSignerCommitment(context: __compactRuntime.CircuitContext<PS>,
                            pk_0: __compactRuntime.JubjubPoint,
                            salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  schnorrChallenge(context: __compactRuntime.CircuitContext<PS>,
                   announcement_0: __compactRuntime.JubjubPoint,
                   pk_0: __compactRuntime.JubjubPoint,
                   msgHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, bigint>;
  schnorrEquationHolds(context: __compactRuntime.CircuitContext<PS>,
                       announcement_0: __compactRuntime.JubjubPoint,
                       response_0: bigint,
                       pk_0: __compactRuntime.JubjubPoint,
                       c_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  mintDigest(context: __compactRuntime.CircuitContext<PS>,
             contractAddress_0: Uint8Array,
             nonce_0: bigint,
             to_0: Uint8Array,
             value_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  burnDigest(context: __compactRuntime.CircuitContext<PS>,
             contractAddress_0: Uint8Array,
             nonce_0: bigint,
             account_0: Uint8Array,
             value_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  setEmergencyPauserDigest(context: __compactRuntime.CircuitContext<PS>,
                           contractAddress_0: Uint8Array,
                           nonce_0: bigint,
                           newPauser_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  adminReallocateDigest(context: __compactRuntime.CircuitContext<PS>,
                        contractAddress_0: Uint8Array,
                        nonce_0: bigint,
                        trappedAccount_0: Uint8Array,
                        targetSpendableAccount_0: Uint8Array,
                        amount_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  rotateSignerDigest(context: __compactRuntime.CircuitContext<PS>,
                     contractAddress_0: Uint8Array,
                     nonce_0: bigint,
                     oldSignerCommitment_0: Uint8Array,
                     newSignerPubkey_0: __compactRuntime.JubjubPoint,
                     contractSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  burnDigestV3(context: __compactRuntime.CircuitContext<PS>,
               contractAddress_0: Uint8Array,
               nonce_0: bigint,
               value_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  withdrawDigest(context: __compactRuntime.CircuitContext<PS>,
                 contractAddress_0: Uint8Array,
                 nonce_0: bigint,
                 to_0: Uint8Array,
                 value_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  rotatePopDigest(context: __compactRuntime.CircuitContext<PS>,
                  msgHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
