import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type SchnorrSignature = { announcement: __compactRuntime.JubjubPoint;
                                 response: bigint
                               };

export type Witnesses<PS> = {
  getSchnorrReduction(context: __compactRuntime.WitnessContext<Ledger, PS>,
                      challengeHash_0: bigint): [PS, [bigint, bigint]];
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  mint(context: __compactRuntime.CircuitContext<PS>,
       to_0: Uint8Array,
       value_0: bigint,
       pubkeys_0: __compactRuntime.JubjubPoint[],
       signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  burn(context: __compactRuntime.CircuitContext<PS>,
       account_0: Uint8Array,
       value_0: bigint,
       pubkeys_0: __compactRuntime.JubjubPoint[],
       signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  setEmergencyPauser(context: __compactRuntime.CircuitContext<PS>,
                     newPauser_0: Uint8Array,
                     pubkeys_0: __compactRuntime.JubjubPoint[],
                     signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  adminReallocate(context: __compactRuntime.CircuitContext<PS>,
                  trappedAccount_0: Uint8Array,
                  targetSpendableAccount_0: Uint8Array,
                  amount_0: bigint,
                  pubkeys_0: __compactRuntime.JubjubPoint[],
                  signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  rotateSigner(context: __compactRuntime.CircuitContext<PS>,
               oldSignerCommitment_0: Uint8Array,
               newSignerPubkey_0: __compactRuntime.JubjubPoint,
               newSignerPop_0: SchnorrSignature,
               pubkeys_0: __compactRuntime.JubjubPoint[],
               signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  pause(context: __compactRuntime.CircuitContext<PS>, caller_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  unpause(context: __compactRuntime.CircuitContext<PS>, caller_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           caller_0: Uint8Array,
           to_0: Uint8Array,
           value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  approve(context: __compactRuntime.CircuitContext<PS>,
          caller_0: Uint8Array,
          spender_0: Uint8Array,
          value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  transferFrom(context: __compactRuntime.CircuitContext<PS>,
               caller_0: Uint8Array,
               fromAccount_0: Uint8Array,
               to_0: Uint8Array,
               value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  selfBurn(context: __compactRuntime.CircuitContext<PS>,
           caller_0: Uint8Array,
           value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  emergencyWithdraw(context: __compactRuntime.CircuitContext<PS>,
                    caller_0: Uint8Array,
                    amount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  mint(context: __compactRuntime.CircuitContext<PS>,
       to_0: Uint8Array,
       value_0: bigint,
       pubkeys_0: __compactRuntime.JubjubPoint[],
       signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  burn(context: __compactRuntime.CircuitContext<PS>,
       account_0: Uint8Array,
       value_0: bigint,
       pubkeys_0: __compactRuntime.JubjubPoint[],
       signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  setEmergencyPauser(context: __compactRuntime.CircuitContext<PS>,
                     newPauser_0: Uint8Array,
                     pubkeys_0: __compactRuntime.JubjubPoint[],
                     signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  adminReallocate(context: __compactRuntime.CircuitContext<PS>,
                  trappedAccount_0: Uint8Array,
                  targetSpendableAccount_0: Uint8Array,
                  amount_0: bigint,
                  pubkeys_0: __compactRuntime.JubjubPoint[],
                  signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  rotateSigner(context: __compactRuntime.CircuitContext<PS>,
               oldSignerCommitment_0: Uint8Array,
               newSignerPubkey_0: __compactRuntime.JubjubPoint,
               newSignerPop_0: SchnorrSignature,
               pubkeys_0: __compactRuntime.JubjubPoint[],
               signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  pause(context: __compactRuntime.CircuitContext<PS>, caller_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  unpause(context: __compactRuntime.CircuitContext<PS>, caller_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           caller_0: Uint8Array,
           to_0: Uint8Array,
           value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  approve(context: __compactRuntime.CircuitContext<PS>,
          caller_0: Uint8Array,
          spender_0: Uint8Array,
          value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  transferFrom(context: __compactRuntime.CircuitContext<PS>,
               caller_0: Uint8Array,
               fromAccount_0: Uint8Array,
               to_0: Uint8Array,
               value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  selfBurn(context: __compactRuntime.CircuitContext<PS>,
           caller_0: Uint8Array,
           value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  emergencyWithdraw(context: __compactRuntime.CircuitContext<PS>,
                    caller_0: Uint8Array,
                    amount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
  calculateSignerCommitment(pk_0: __compactRuntime.JubjubPoint,
                            salt_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  calculateSignerCommitment(context: __compactRuntime.CircuitContext<PS>,
                            pk_0: __compactRuntime.JubjubPoint,
                            salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  mint(context: __compactRuntime.CircuitContext<PS>,
       to_0: Uint8Array,
       value_0: bigint,
       pubkeys_0: __compactRuntime.JubjubPoint[],
       signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  burn(context: __compactRuntime.CircuitContext<PS>,
       account_0: Uint8Array,
       value_0: bigint,
       pubkeys_0: __compactRuntime.JubjubPoint[],
       signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  setEmergencyPauser(context: __compactRuntime.CircuitContext<PS>,
                     newPauser_0: Uint8Array,
                     pubkeys_0: __compactRuntime.JubjubPoint[],
                     signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  adminReallocate(context: __compactRuntime.CircuitContext<PS>,
                  trappedAccount_0: Uint8Array,
                  targetSpendableAccount_0: Uint8Array,
                  amount_0: bigint,
                  pubkeys_0: __compactRuntime.JubjubPoint[],
                  signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  rotateSigner(context: __compactRuntime.CircuitContext<PS>,
               oldSignerCommitment_0: Uint8Array,
               newSignerPubkey_0: __compactRuntime.JubjubPoint,
               newSignerPop_0: SchnorrSignature,
               pubkeys_0: __compactRuntime.JubjubPoint[],
               signatures_0: SchnorrSignature[]): __compactRuntime.CircuitResults<PS, boolean>;
  pause(context: __compactRuntime.CircuitContext<PS>, caller_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  unpause(context: __compactRuntime.CircuitContext<PS>, caller_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  transfer(context: __compactRuntime.CircuitContext<PS>,
           caller_0: Uint8Array,
           to_0: Uint8Array,
           value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  approve(context: __compactRuntime.CircuitContext<PS>,
          caller_0: Uint8Array,
          spender_0: Uint8Array,
          value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  transferFrom(context: __compactRuntime.CircuitContext<PS>,
               caller_0: Uint8Array,
               fromAccount_0: Uint8Array,
               to_0: Uint8Array,
               value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  selfBurn(context: __compactRuntime.CircuitContext<PS>,
           caller_0: Uint8Array,
           value_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  emergencyWithdraw(context: __compactRuntime.CircuitContext<PS>,
                    caller_0: Uint8Array,
                    amount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  _balances: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): bigint;
    [Symbol.iterator](): Iterator<[Uint8Array, bigint]>
  };
  _allowances: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: [Uint8Array, Uint8Array]): boolean;
    lookup(key_0: [Uint8Array, Uint8Array]): bigint;
    [Symbol.iterator](): Iterator<[[Uint8Array, Uint8Array], bigint]>
  };
  readonly _totalSupply: bigint;
  readonly _maxSupply: bigint;
  readonly _name: string;
  readonly _symbol: string;
  readonly _decimals: bigint;
  readonly owner: Uint8Array;
  readonly _contractSalt: Uint8Array;
  readonly _paused: boolean;
  readonly _emergencyPauser: Uint8Array;
  _multisigSigners: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  readonly _multisigThreshold: bigint;
  readonly _multisigSignerCount: bigint;
  readonly _multisigNonce: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               salt__0: Uint8Array,
               initialOwner_0: Uint8Array,
               name__0: string,
               symbol__0: string,
               decimals__0: bigint,
               maxSupply__0: bigint,
               initialSigners_0: Uint8Array[],
               threshold__0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
