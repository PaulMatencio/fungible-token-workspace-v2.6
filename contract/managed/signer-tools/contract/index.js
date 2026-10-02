import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

const _descriptor_3 = __compactRuntime.CompactTypeJubjubPoint;

const _descriptor_4 = __compactRuntime.CompactTypeField;

const _descriptor_5 = __compactRuntime.CompactTypeBoolean;

const _descriptor_6 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

const _descriptor_7 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_8 = new __compactRuntime.CompactTypeVector(6, _descriptor_0);

const _descriptor_9 = new __compactRuntime.CompactTypeVector(4, _descriptor_0);

const _descriptor_10 = new __compactRuntime.CompactTypeVector(1, _descriptor_4);

class _SchnorrHashInput_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_4.alignment().concat(_descriptor_4.alignment().concat(_descriptor_4.alignment().concat(_descriptor_10.alignment()))));
  }
  fromValue(value_0) {
    return {
      ann_x: _descriptor_4.fromValue(value_0),
      ann_y: _descriptor_4.fromValue(value_0),
      pk_x: _descriptor_4.fromValue(value_0),
      pk_y: _descriptor_4.fromValue(value_0),
      msg: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.ann_x).concat(_descriptor_4.toValue(value_0.ann_y).concat(_descriptor_4.toValue(value_0.pk_x).concat(_descriptor_4.toValue(value_0.pk_y).concat(_descriptor_10.toValue(value_0.msg)))));
  }
}

const _descriptor_11 = new _SchnorrHashInput_0();

class _Either_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_5.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_12 = new _Either_0();

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_13 = new _ContractAddress_0();

const _descriptor_14 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      derivePublicKey(context, ...args_1) {
        return { result: pureCircuits.derivePublicKey(...args_1), context };
      },
      calculateSignerCommitment(context, ...args_1) {
        return { result: pureCircuits.calculateSignerCommitment(...args_1), context };
      },
      schnorrChallenge(context, ...args_1) {
        return { result: pureCircuits.schnorrChallenge(...args_1), context };
      },
      schnorrEquationHolds(context, ...args_1) {
        return { result: pureCircuits.schnorrEquationHolds(...args_1), context };
      },
      mintDigest(context, ...args_1) {
        return { result: pureCircuits.mintDigest(...args_1), context };
      },
      burnDigest(context, ...args_1) {
        return { result: pureCircuits.burnDigest(...args_1), context };
      },
      setEmergencyPauserDigest(context, ...args_1) {
        return { result: pureCircuits.setEmergencyPauserDigest(...args_1), context };
      },
      adminReallocateDigest(context, ...args_1) {
        return { result: pureCircuits.adminReallocateDigest(...args_1), context };
      },
      rotateSignerDigest(context, ...args_1) {
        return { result: pureCircuits.rotateSignerDigest(...args_1), context };
      },
      burnDigestV3(context, ...args_1) {
        return { result: pureCircuits.burnDigestV3(...args_1), context };
      },
      withdrawDigest(context, ...args_1) {
        return { result: pureCircuits.withdrawDigest(...args_1), context };
      },
      rotatePopDigest(context, ...args_1) {
        return { result: pureCircuits.rotatePopDigest(...args_1), context };
      }
    };
    this.impureCircuits = {};
    this.provableCircuits = {};
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_0, value_0);
    return result_0;
  }
  _transientHash_1(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_11, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_8, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_9, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_6, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_7, value_0);
    return result_0;
  }
  _jubjubPointX_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointX(np_0);
    return result_0;
  }
  _jubjubPointY_0(np_0) {
    const result_0 = __compactRuntime.jubjubPointY(np_0);
    return result_0;
  }
  _ecAdd_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecAdd(a_0, b_0);
    return result_0;
  }
  _ecMul_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecMul(a_0, b_0);
    return result_0;
  }
  _ecMulGenerator_0(b_0) {
    const result_0 = __compactRuntime.ecMulGenerator(b_0);
    return result_0;
  }
  _derivePublicKey_0(sk_0) { return this._ecMulGenerator_0(sk_0); }
  _calculateSignerCommitment_0(pk_0, salt_0) {
    return this._persistentHash_1([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 115, 105, 103, 110, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   salt_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        this._jubjubPointX_0(pk_0),
                                                                        'signer-tools.compact line 41 char 5'),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        this._jubjubPointY_0(pk_0),
                                                                        'signer-tools.compact line 42 char 5')]);
  }
  _schnorrChallenge_0(announcement_0, pk_0, msgHash_0) {
    const msgVec_0 = [this._transientHash_0(msgHash_0)];
    return this._transientHash_1({ ann_x: this._jubjubPointX_0(announcement_0),
                                   ann_y: this._jubjubPointY_0(announcement_0),
                                   pk_x: this._jubjubPointX_0(pk_0),
                                   pk_y: this._jubjubPointY_0(pk_0),
                                   msg: msgVec_0 });
  }
  _schnorrEquationHolds_0(announcement_0, response_0, pk_0, c_0) {
    const lhs_0 = this._ecMulGenerator_0(response_0);
    const rhs_0 = this._ecAdd_0(announcement_0, this._ecMul_0(pk_0, c_0));
    return this._jubjubPointX_0(lhs_0) === this._jubjubPointX_0(rhs_0)
           &&
           this._jubjubPointY_0(lhs_0) === this._jubjubPointY_0(rhs_0);
  }
  _mintDigest_0(contractAddress_0, nonce_0, to_0, value_0) {
    return this._persistentHash_2([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 109, 105, 110, 116, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   contractAddress_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        nonce_0,
                                                                        'signer-tools.compact line 92 char 5'),
                                   to_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        value_0,
                                                                        'signer-tools.compact line 94 char 5')]);
  }
  _burnDigest_0(contractAddress_0, nonce_0, account_0, value_0) {
    return this._persistentHash_2([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 98, 117, 114, 110, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   contractAddress_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        nonce_0,
                                                                        'signer-tools.compact line 107 char 5'),
                                   account_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        value_0,
                                                                        'signer-tools.compact line 109 char 5')]);
  }
  _setEmergencyPauserDigest_0(contractAddress_0, nonce_0, newPauser_0) {
    return this._persistentHash_1([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 115, 101, 116, 45, 112, 97, 117, 115, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   contractAddress_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        nonce_0,
                                                                        'signer-tools.compact line 121 char 5'),
                                   newPauser_0]);
  }
  _adminReallocateDigest_0(contractAddress_0,
                           nonce_0,
                           trappedAccount_0,
                           targetSpendableAccount_0,
                           amount_0)
  {
    return this._persistentHash_0([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 114, 101, 97, 108, 108, 111, 99, 97, 116, 101, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   contractAddress_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        nonce_0,
                                                                        'signer-tools.compact line 136 char 5'),
                                   trappedAccount_0,
                                   targetSpendableAccount_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        amount_0,
                                                                        'signer-tools.compact line 139 char 5')]);
  }
  _rotateSignerDigest_0(contractAddress_0,
                        nonce_0,
                        oldSignerCommitment_0,
                        newSignerPubkey_0,
                        contractSalt_0)
  {
    const newSignerCommitment_0 = this._calculateSignerCommitment_0(newSignerPubkey_0,
                                                                    contractSalt_0);
    return this._persistentHash_2([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 114, 111, 116, 97, 116, 101, 45, 115, 105, 103, 110, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   contractAddress_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        nonce_0,
                                                                        'signer-tools.compact line 156 char 5'),
                                   oldSignerCommitment_0,
                                   newSignerCommitment_0]);
  }
  _burnDigestV3_0(contractAddress_0, nonce_0, value_0) {
    return this._persistentHash_1([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 98, 117, 114, 110, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   contractAddress_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        nonce_0,
                                                                        'signer-tools.compact line 169 char 5'),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        value_0,
                                                                        'signer-tools.compact line 170 char 5')]);
  }
  _withdrawDigest_0(contractAddress_0, nonce_0, to_0, value_0) {
    return this._persistentHash_2([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 119, 105, 116, 104, 100, 114, 97, 119, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   contractAddress_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        nonce_0,
                                                                        'signer-tools.compact line 179 char 5'),
                                   to_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        value_0,
                                                                        'signer-tools.compact line 181 char 5')]);
  }
  _rotatePopDigest_0(msgHash_0) {
    return this._persistentHash_3([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 114, 111, 116, 97, 116, 101, 45, 112, 111, 112, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   msgHash_0]);
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
export const pureCircuits = {
  derivePublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`derivePublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(typeof(sk_0) === 'bigint' && sk_0 >= 0 && sk_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('derivePublicKey',
                                 'argument 1',
                                 'signer-tools.compact line 32 char 1',
                                 'Field',
                                 sk_0)
    }
    return _dummyContract._derivePublicKey_0(sk_0);
  },
  calculateSignerCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`calculateSignerCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const pk_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('calculateSignerCommitment',
                                 'argument 2',
                                 'signer-tools.compact line 37 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._calculateSignerCommitment_0(pk_0, salt_0);
  },
  schnorrChallenge: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`schnorrChallenge: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const announcement_0 = args_0[0];
    const pk_0 = args_0[1];
    const msgHash_0 = args_0[2];
    if (!(msgHash_0.buffer instanceof ArrayBuffer && msgHash_0.BYTES_PER_ELEMENT === 1 && msgHash_0.length === 32)) {
      __compactRuntime.typeError('schnorrChallenge',
                                 'argument 3',
                                 'signer-tools.compact line 49 char 1',
                                 'Bytes<32>',
                                 msgHash_0)
    }
    return _dummyContract._schnorrChallenge_0(announcement_0, pk_0, msgHash_0);
  },
  schnorrEquationHolds: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`schnorrEquationHolds: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const announcement_0 = args_0[0];
    const response_0 = args_0[1];
    const pk_0 = args_0[2];
    const c_0 = args_0[3];
    if (!(typeof(response_0) === 'bigint' && response_0 >= 0 && response_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('schnorrEquationHolds',
                                 'argument 2',
                                 'signer-tools.compact line 68 char 1',
                                 'Field',
                                 response_0)
    }
    if (!(typeof(c_0) === 'bigint' && c_0 >= 0 && c_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('schnorrEquationHolds',
                                 'argument 4',
                                 'signer-tools.compact line 68 char 1',
                                 'Field',
                                 c_0)
    }
    return _dummyContract._schnorrEquationHolds_0(announcement_0,
                                                  response_0,
                                                  pk_0,
                                                  c_0);
  },
  mintDigest: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`mintDigest: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const contractAddress_0 = args_0[0];
    const nonce_0 = args_0[1];
    const to_0 = args_0[2];
    const value_0 = args_0[3];
    if (!(contractAddress_0.buffer instanceof ArrayBuffer && contractAddress_0.BYTES_PER_ELEMENT === 1 && contractAddress_0.length === 32)) {
      __compactRuntime.typeError('mintDigest',
                                 'argument 1',
                                 'signer-tools.compact line 83 char 1',
                                 'Bytes<32>',
                                 contractAddress_0)
    }
    if (!(typeof(nonce_0) === 'bigint' && nonce_0 >= 0n && nonce_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('mintDigest',
                                 'argument 2',
                                 'signer-tools.compact line 83 char 1',
                                 'Uint<0..18446744073709551616>',
                                 nonce_0)
    }
    if (!(to_0.buffer instanceof ArrayBuffer && to_0.BYTES_PER_ELEMENT === 1 && to_0.length === 32)) {
      __compactRuntime.typeError('mintDigest',
                                 'argument 3',
                                 'signer-tools.compact line 83 char 1',
                                 'Bytes<32>',
                                 to_0)
    }
    if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('mintDigest',
                                 'argument 4',
                                 'signer-tools.compact line 83 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 value_0)
    }
    return _dummyContract._mintDigest_0(contractAddress_0,
                                        nonce_0,
                                        to_0,
                                        value_0);
  },
  burnDigest: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`burnDigest: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const contractAddress_0 = args_0[0];
    const nonce_0 = args_0[1];
    const account_0 = args_0[2];
    const value_0 = args_0[3];
    if (!(contractAddress_0.buffer instanceof ArrayBuffer && contractAddress_0.BYTES_PER_ELEMENT === 1 && contractAddress_0.length === 32)) {
      __compactRuntime.typeError('burnDigest',
                                 'argument 1',
                                 'signer-tools.compact line 98 char 1',
                                 'Bytes<32>',
                                 contractAddress_0)
    }
    if (!(typeof(nonce_0) === 'bigint' && nonce_0 >= 0n && nonce_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('burnDigest',
                                 'argument 2',
                                 'signer-tools.compact line 98 char 1',
                                 'Uint<0..18446744073709551616>',
                                 nonce_0)
    }
    if (!(account_0.buffer instanceof ArrayBuffer && account_0.BYTES_PER_ELEMENT === 1 && account_0.length === 32)) {
      __compactRuntime.typeError('burnDigest',
                                 'argument 3',
                                 'signer-tools.compact line 98 char 1',
                                 'Bytes<32>',
                                 account_0)
    }
    if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('burnDigest',
                                 'argument 4',
                                 'signer-tools.compact line 98 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 value_0)
    }
    return _dummyContract._burnDigest_0(contractAddress_0,
                                        nonce_0,
                                        account_0,
                                        value_0);
  },
  setEmergencyPauserDigest: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`setEmergencyPauserDigest: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const contractAddress_0 = args_0[0];
    const nonce_0 = args_0[1];
    const newPauser_0 = args_0[2];
    if (!(contractAddress_0.buffer instanceof ArrayBuffer && contractAddress_0.BYTES_PER_ELEMENT === 1 && contractAddress_0.length === 32)) {
      __compactRuntime.typeError('setEmergencyPauserDigest',
                                 'argument 1',
                                 'signer-tools.compact line 113 char 1',
                                 'Bytes<32>',
                                 contractAddress_0)
    }
    if (!(typeof(nonce_0) === 'bigint' && nonce_0 >= 0n && nonce_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('setEmergencyPauserDigest',
                                 'argument 2',
                                 'signer-tools.compact line 113 char 1',
                                 'Uint<0..18446744073709551616>',
                                 nonce_0)
    }
    if (!(newPauser_0.buffer instanceof ArrayBuffer && newPauser_0.BYTES_PER_ELEMENT === 1 && newPauser_0.length === 32)) {
      __compactRuntime.typeError('setEmergencyPauserDigest',
                                 'argument 3',
                                 'signer-tools.compact line 113 char 1',
                                 'Bytes<32>',
                                 newPauser_0)
    }
    return _dummyContract._setEmergencyPauserDigest_0(contractAddress_0,
                                                      nonce_0,
                                                      newPauser_0);
  },
  adminReallocateDigest: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`adminReallocateDigest: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const contractAddress_0 = args_0[0];
    const nonce_0 = args_0[1];
    const trappedAccount_0 = args_0[2];
    const targetSpendableAccount_0 = args_0[3];
    const amount_0 = args_0[4];
    if (!(contractAddress_0.buffer instanceof ArrayBuffer && contractAddress_0.BYTES_PER_ELEMENT === 1 && contractAddress_0.length === 32)) {
      __compactRuntime.typeError('adminReallocateDigest',
                                 'argument 1',
                                 'signer-tools.compact line 126 char 1',
                                 'Bytes<32>',
                                 contractAddress_0)
    }
    if (!(typeof(nonce_0) === 'bigint' && nonce_0 >= 0n && nonce_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('adminReallocateDigest',
                                 'argument 2',
                                 'signer-tools.compact line 126 char 1',
                                 'Uint<0..18446744073709551616>',
                                 nonce_0)
    }
    if (!(trappedAccount_0.buffer instanceof ArrayBuffer && trappedAccount_0.BYTES_PER_ELEMENT === 1 && trappedAccount_0.length === 32)) {
      __compactRuntime.typeError('adminReallocateDigest',
                                 'argument 3',
                                 'signer-tools.compact line 126 char 1',
                                 'Bytes<32>',
                                 trappedAccount_0)
    }
    if (!(targetSpendableAccount_0.buffer instanceof ArrayBuffer && targetSpendableAccount_0.BYTES_PER_ELEMENT === 1 && targetSpendableAccount_0.length === 32)) {
      __compactRuntime.typeError('adminReallocateDigest',
                                 'argument 4',
                                 'signer-tools.compact line 126 char 1',
                                 'Bytes<32>',
                                 targetSpendableAccount_0)
    }
    if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('adminReallocateDigest',
                                 'argument 5',
                                 'signer-tools.compact line 126 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 amount_0)
    }
    return _dummyContract._adminReallocateDigest_0(contractAddress_0,
                                                   nonce_0,
                                                   trappedAccount_0,
                                                   targetSpendableAccount_0,
                                                   amount_0);
  },
  rotateSignerDigest: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`rotateSignerDigest: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const contractAddress_0 = args_0[0];
    const nonce_0 = args_0[1];
    const oldSignerCommitment_0 = args_0[2];
    const newSignerPubkey_0 = args_0[3];
    const contractSalt_0 = args_0[4];
    if (!(contractAddress_0.buffer instanceof ArrayBuffer && contractAddress_0.BYTES_PER_ELEMENT === 1 && contractAddress_0.length === 32)) {
      __compactRuntime.typeError('rotateSignerDigest',
                                 'argument 1',
                                 'signer-tools.compact line 145 char 1',
                                 'Bytes<32>',
                                 contractAddress_0)
    }
    if (!(typeof(nonce_0) === 'bigint' && nonce_0 >= 0n && nonce_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('rotateSignerDigest',
                                 'argument 2',
                                 'signer-tools.compact line 145 char 1',
                                 'Uint<0..18446744073709551616>',
                                 nonce_0)
    }
    if (!(oldSignerCommitment_0.buffer instanceof ArrayBuffer && oldSignerCommitment_0.BYTES_PER_ELEMENT === 1 && oldSignerCommitment_0.length === 32)) {
      __compactRuntime.typeError('rotateSignerDigest',
                                 'argument 3',
                                 'signer-tools.compact line 145 char 1',
                                 'Bytes<32>',
                                 oldSignerCommitment_0)
    }
    if (!(contractSalt_0.buffer instanceof ArrayBuffer && contractSalt_0.BYTES_PER_ELEMENT === 1 && contractSalt_0.length === 32)) {
      __compactRuntime.typeError('rotateSignerDigest',
                                 'argument 5',
                                 'signer-tools.compact line 145 char 1',
                                 'Bytes<32>',
                                 contractSalt_0)
    }
    return _dummyContract._rotateSignerDigest_0(contractAddress_0,
                                                nonce_0,
                                                oldSignerCommitment_0,
                                                newSignerPubkey_0,
                                                contractSalt_0);
  },
  burnDigestV3: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`burnDigestV3: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const contractAddress_0 = args_0[0];
    const nonce_0 = args_0[1];
    const value_0 = args_0[2];
    if (!(contractAddress_0.buffer instanceof ArrayBuffer && contractAddress_0.BYTES_PER_ELEMENT === 1 && contractAddress_0.length === 32)) {
      __compactRuntime.typeError('burnDigestV3',
                                 'argument 1',
                                 'signer-tools.compact line 165 char 1',
                                 'Bytes<32>',
                                 contractAddress_0)
    }
    if (!(typeof(nonce_0) === 'bigint' && nonce_0 >= 0n && nonce_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('burnDigestV3',
                                 'argument 2',
                                 'signer-tools.compact line 165 char 1',
                                 'Uint<0..18446744073709551616>',
                                 nonce_0)
    }
    if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('burnDigestV3',
                                 'argument 3',
                                 'signer-tools.compact line 165 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 value_0)
    }
    return _dummyContract._burnDigestV3_0(contractAddress_0, nonce_0, value_0);
  },
  withdrawDigest: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`withdrawDigest: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const contractAddress_0 = args_0[0];
    const nonce_0 = args_0[1];
    const to_0 = args_0[2];
    const value_0 = args_0[3];
    if (!(contractAddress_0.buffer instanceof ArrayBuffer && contractAddress_0.BYTES_PER_ELEMENT === 1 && contractAddress_0.length === 32)) {
      __compactRuntime.typeError('withdrawDigest',
                                 'argument 1',
                                 'signer-tools.compact line 175 char 1',
                                 'Bytes<32>',
                                 contractAddress_0)
    }
    if (!(typeof(nonce_0) === 'bigint' && nonce_0 >= 0n && nonce_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('withdrawDigest',
                                 'argument 2',
                                 'signer-tools.compact line 175 char 1',
                                 'Uint<0..18446744073709551616>',
                                 nonce_0)
    }
    if (!(to_0.buffer instanceof ArrayBuffer && to_0.BYTES_PER_ELEMENT === 1 && to_0.length === 32)) {
      __compactRuntime.typeError('withdrawDigest',
                                 'argument 3',
                                 'signer-tools.compact line 175 char 1',
                                 'Bytes<32>',
                                 to_0)
    }
    if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('withdrawDigest',
                                 'argument 4',
                                 'signer-tools.compact line 175 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 value_0)
    }
    return _dummyContract._withdrawDigest_0(contractAddress_0,
                                            nonce_0,
                                            to_0,
                                            value_0);
  },
  rotatePopDigest: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`rotatePopDigest: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const msgHash_0 = args_0[0];
    if (!(msgHash_0.buffer instanceof ArrayBuffer && msgHash_0.BYTES_PER_ELEMENT === 1 && msgHash_0.length === 32)) {
      __compactRuntime.typeError('rotatePopDigest',
                                 'argument 1',
                                 'signer-tools.compact line 185 char 1',
                                 'Bytes<32>',
                                 msgHash_0)
    }
    return _dummyContract._rotatePopDigest_0(msgHash_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
