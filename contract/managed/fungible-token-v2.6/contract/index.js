import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = __compactRuntime.CompactTypeBoolean;

class _tuple_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_0.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_2 = new _tuple_0();

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

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

const _descriptor_4 = new _ContractAddress_0();

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_7 = __compactRuntime.CompactTypeJubjubPoint;

const _descriptor_8 = new __compactRuntime.CompactTypeVector(3, _descriptor_7);

const _descriptor_9 = __compactRuntime.CompactTypeField;

class _SchnorrSignature_0 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_9.alignment());
  }
  fromValue(value_0) {
    return {
      announcement: _descriptor_7.fromValue(value_0),
      response: _descriptor_9.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.announcement).concat(_descriptor_9.toValue(value_0.response));
  }
}

const _descriptor_10 = new _SchnorrSignature_0();

const _descriptor_11 = new __compactRuntime.CompactTypeVector(3, _descriptor_10);

const _descriptor_12 = new __compactRuntime.CompactTypeVector(1, _descriptor_9);

const _descriptor_13 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_14 = new __compactRuntime.CompactTypeUnsignedInteger(452312848583266388373324160190187140051835877600158453279131187530910662655n, 31);

class _tuple_1 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_14.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_9.fromValue(value_0),
      _descriptor_14.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0[0]).concat(_descriptor_14.toValue(value_0[1]));
  }
}

const _descriptor_15 = new _tuple_1();

class _tuple_2 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return [
      _descriptor_0.fromValue(value_0),
      _descriptor_0.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]).concat(_descriptor_0.toValue(value_0[2])));
  }
}

const _descriptor_16 = new _tuple_2();

class _tuple_3 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_4.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_0.fromValue(value_0),
      _descriptor_4.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0[0]).concat(_descriptor_4.toValue(value_0[1]));
  }
}

const _descriptor_17 = new _tuple_3();

const _descriptor_18 = new __compactRuntime.CompactTypeVector(6, _descriptor_0);

const _descriptor_19 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

class _SchnorrHashInput_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_9.alignment().concat(_descriptor_12.alignment()))));
  }
  fromValue(value_0) {
    return {
      ann_x: _descriptor_9.fromValue(value_0),
      ann_y: _descriptor_9.fromValue(value_0),
      pk_x: _descriptor_9.fromValue(value_0),
      pk_y: _descriptor_9.fromValue(value_0),
      msg: _descriptor_12.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.ann_x).concat(_descriptor_9.toValue(value_0.ann_y).concat(_descriptor_9.toValue(value_0.pk_x).concat(_descriptor_9.toValue(value_0.pk_y).concat(_descriptor_12.toValue(value_0.msg)))));
  }
}

const _descriptor_20 = new _SchnorrHashInput_0();

const _descriptor_21 = new __compactRuntime.CompactTypeVector(4, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_1.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_22 = new _Either_0();

const _descriptor_23 = __compactRuntime.CompactTypeOpaqueString;

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
    if (typeof(witnesses_0.getSchnorrReduction) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getSchnorrReduction');
    }
    if (typeof(witnesses_0.localSecretKey) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named localSecretKey');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      calculateSignerCommitment(context, ...args_1) {
        return { result: pureCircuits.calculateSignerCommitment(...args_1), context };
      },
      mint: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`mint: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const to_0 = args_1[1];
        const value_0 = args_1[2];
        const pubkeys_0 = args_1[3];
        const signatures_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('mint',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 308 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(to_0.buffer instanceof ArrayBuffer && to_0.BYTES_PER_ELEMENT === 1 && to_0.length === 32)) {
          __compactRuntime.typeError('mint',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 308 char 1',
                                     'Bytes<32>',
                                     to_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('mint',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 308 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        if (!(Array.isArray(pubkeys_0) && pubkeys_0.length === 3 && pubkeys_0.every((t) => true))) {
          __compactRuntime.typeError('mint',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 308 char 1',
                                     'Vector<3, Opaque<"JubjubPoint">>',
                                     pubkeys_0)
        }
        if (!(Array.isArray(signatures_0) && signatures_0.length === 3 && signatures_0.every((t) => typeof(t) === 'object' && true && typeof(t.response) === 'bigint' && t.response >= 0 && t.response <= __compactRuntime.MAX_FIELD))) {
          __compactRuntime.typeError('mint',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 308 char 1',
                                     'Vector<3, struct SchnorrSignature<announcement: Opaque<"JubjubPoint">, response: Field>>',
                                     signatures_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(to_0).concat(_descriptor_3.toValue(value_0).concat(_descriptor_8.toValue(pubkeys_0).concat(_descriptor_11.toValue(signatures_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_8.alignment().concat(_descriptor_11.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._mint_0(context,
                                      partialProofData,
                                      to_0,
                                      value_0,
                                      pubkeys_0,
                                      signatures_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      burn: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`burn: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const account_0 = args_1[1];
        const value_0 = args_1[2];
        const pubkeys_0 = args_1[3];
        const signatures_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('burn',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 340 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(account_0.buffer instanceof ArrayBuffer && account_0.BYTES_PER_ELEMENT === 1 && account_0.length === 32)) {
          __compactRuntime.typeError('burn',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 340 char 1',
                                     'Bytes<32>',
                                     account_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('burn',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 340 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        if (!(Array.isArray(pubkeys_0) && pubkeys_0.length === 3 && pubkeys_0.every((t) => true))) {
          __compactRuntime.typeError('burn',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 340 char 1',
                                     'Vector<3, Opaque<"JubjubPoint">>',
                                     pubkeys_0)
        }
        if (!(Array.isArray(signatures_0) && signatures_0.length === 3 && signatures_0.every((t) => typeof(t) === 'object' && true && typeof(t.response) === 'bigint' && t.response >= 0 && t.response <= __compactRuntime.MAX_FIELD))) {
          __compactRuntime.typeError('burn',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 340 char 1',
                                     'Vector<3, struct SchnorrSignature<announcement: Opaque<"JubjubPoint">, response: Field>>',
                                     signatures_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(account_0).concat(_descriptor_3.toValue(value_0).concat(_descriptor_8.toValue(pubkeys_0).concat(_descriptor_11.toValue(signatures_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_8.alignment().concat(_descriptor_11.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._burn_0(context,
                                      partialProofData,
                                      account_0,
                                      value_0,
                                      pubkeys_0,
                                      signatures_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      setEmergencyPauser: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`setEmergencyPauser: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const newPauser_0 = args_1[1];
        const pubkeys_0 = args_1[2];
        const signatures_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('setEmergencyPauser',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 371 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(newPauser_0.buffer instanceof ArrayBuffer && newPauser_0.BYTES_PER_ELEMENT === 1 && newPauser_0.length === 32)) {
          __compactRuntime.typeError('setEmergencyPauser',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 371 char 1',
                                     'Bytes<32>',
                                     newPauser_0)
        }
        if (!(Array.isArray(pubkeys_0) && pubkeys_0.length === 3 && pubkeys_0.every((t) => true))) {
          __compactRuntime.typeError('setEmergencyPauser',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 371 char 1',
                                     'Vector<3, Opaque<"JubjubPoint">>',
                                     pubkeys_0)
        }
        if (!(Array.isArray(signatures_0) && signatures_0.length === 3 && signatures_0.every((t) => typeof(t) === 'object' && true && typeof(t.response) === 'bigint' && t.response >= 0 && t.response <= __compactRuntime.MAX_FIELD))) {
          __compactRuntime.typeError('setEmergencyPauser',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 371 char 1',
                                     'Vector<3, struct SchnorrSignature<announcement: Opaque<"JubjubPoint">, response: Field>>',
                                     signatures_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(newPauser_0).concat(_descriptor_8.toValue(pubkeys_0).concat(_descriptor_11.toValue(signatures_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_8.alignment().concat(_descriptor_11.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._setEmergencyPauser_0(context,
                                                    partialProofData,
                                                    newPauser_0,
                                                    pubkeys_0,
                                                    signatures_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      adminReallocate: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`adminReallocate: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const trappedAccount_0 = args_1[1];
        const targetSpendableAccount_0 = args_1[2];
        const amount_0 = args_1[3];
        const pubkeys_0 = args_1[4];
        const signatures_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('adminReallocate',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 404 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(trappedAccount_0.buffer instanceof ArrayBuffer && trappedAccount_0.BYTES_PER_ELEMENT === 1 && trappedAccount_0.length === 32)) {
          __compactRuntime.typeError('adminReallocate',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 404 char 1',
                                     'Bytes<32>',
                                     trappedAccount_0)
        }
        if (!(targetSpendableAccount_0.buffer instanceof ArrayBuffer && targetSpendableAccount_0.BYTES_PER_ELEMENT === 1 && targetSpendableAccount_0.length === 32)) {
          __compactRuntime.typeError('adminReallocate',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 404 char 1',
                                     'Bytes<32>',
                                     targetSpendableAccount_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('adminReallocate',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 404 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     amount_0)
        }
        if (!(Array.isArray(pubkeys_0) && pubkeys_0.length === 3 && pubkeys_0.every((t) => true))) {
          __compactRuntime.typeError('adminReallocate',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 404 char 1',
                                     'Vector<3, Opaque<"JubjubPoint">>',
                                     pubkeys_0)
        }
        if (!(Array.isArray(signatures_0) && signatures_0.length === 3 && signatures_0.every((t) => typeof(t) === 'object' && true && typeof(t.response) === 'bigint' && t.response >= 0 && t.response <= __compactRuntime.MAX_FIELD))) {
          __compactRuntime.typeError('adminReallocate',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 404 char 1',
                                     'Vector<3, struct SchnorrSignature<announcement: Opaque<"JubjubPoint">, response: Field>>',
                                     signatures_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(trappedAccount_0).concat(_descriptor_0.toValue(targetSpendableAccount_0).concat(_descriptor_3.toValue(amount_0).concat(_descriptor_8.toValue(pubkeys_0).concat(_descriptor_11.toValue(signatures_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_8.alignment().concat(_descriptor_11.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._adminReallocate_0(context,
                                                 partialProofData,
                                                 trappedAccount_0,
                                                 targetSpendableAccount_0,
                                                 amount_0,
                                                 pubkeys_0,
                                                 signatures_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      rotateSigner: (...args_1) => {
        if (args_1.length !== 6) {
          throw new __compactRuntime.CompactError(`rotateSigner: expected 6 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const oldSignerCommitment_0 = args_1[1];
        const newSignerPubkey_0 = args_1[2];
        const newSignerPop_0 = args_1[3];
        const pubkeys_0 = args_1[4];
        const signatures_0 = args_1[5];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('rotateSigner',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 453 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(oldSignerCommitment_0.buffer instanceof ArrayBuffer && oldSignerCommitment_0.BYTES_PER_ELEMENT === 1 && oldSignerCommitment_0.length === 32)) {
          __compactRuntime.typeError('rotateSigner',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 453 char 1',
                                     'Bytes<32>',
                                     oldSignerCommitment_0)
        }
        if (!(typeof(newSignerPop_0) === 'object' && true && typeof(newSignerPop_0.response) === 'bigint' && newSignerPop_0.response >= 0 && newSignerPop_0.response <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('rotateSigner',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 453 char 1',
                                     'struct SchnorrSignature<announcement: Opaque<"JubjubPoint">, response: Field>',
                                     newSignerPop_0)
        }
        if (!(Array.isArray(pubkeys_0) && pubkeys_0.length === 3 && pubkeys_0.every((t) => true))) {
          __compactRuntime.typeError('rotateSigner',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 453 char 1',
                                     'Vector<3, Opaque<"JubjubPoint">>',
                                     pubkeys_0)
        }
        if (!(Array.isArray(signatures_0) && signatures_0.length === 3 && signatures_0.every((t) => typeof(t) === 'object' && true && typeof(t.response) === 'bigint' && t.response >= 0 && t.response <= __compactRuntime.MAX_FIELD))) {
          __compactRuntime.typeError('rotateSigner',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 453 char 1',
                                     'Vector<3, struct SchnorrSignature<announcement: Opaque<"JubjubPoint">, response: Field>>',
                                     signatures_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(oldSignerCommitment_0).concat(_descriptor_7.toValue(newSignerPubkey_0).concat(_descriptor_10.toValue(newSignerPop_0).concat(_descriptor_8.toValue(pubkeys_0).concat(_descriptor_11.toValue(signatures_0))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_7.alignment().concat(_descriptor_10.alignment().concat(_descriptor_8.alignment().concat(_descriptor_11.alignment()))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._rotateSigner_0(context,
                                              partialProofData,
                                              oldSignerCommitment_0,
                                              newSignerPubkey_0,
                                              newSignerPop_0,
                                              pubkeys_0,
                                              signatures_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      pause: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`pause: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const caller_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('pause',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 500 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(caller_0.buffer instanceof ArrayBuffer && caller_0.BYTES_PER_ELEMENT === 1 && caller_0.length === 32)) {
          __compactRuntime.typeError('pause',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 500 char 1',
                                     'Bytes<32>',
                                     caller_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(caller_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._pause_0(context, partialProofData, caller_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      unpause: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`unpause: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const caller_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('unpause',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 511 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(caller_0.buffer instanceof ArrayBuffer && caller_0.BYTES_PER_ELEMENT === 1 && caller_0.length === 32)) {
          __compactRuntime.typeError('unpause',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 511 char 1',
                                     'Bytes<32>',
                                     caller_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(caller_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._unpause_0(context, partialProofData, caller_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      transfer: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`transfer: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const caller_0 = args_1[1];
        const to_0 = args_1[2];
        const value_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('transfer',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 520 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(caller_0.buffer instanceof ArrayBuffer && caller_0.BYTES_PER_ELEMENT === 1 && caller_0.length === 32)) {
          __compactRuntime.typeError('transfer',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 520 char 1',
                                     'Bytes<32>',
                                     caller_0)
        }
        if (!(to_0.buffer instanceof ArrayBuffer && to_0.BYTES_PER_ELEMENT === 1 && to_0.length === 32)) {
          __compactRuntime.typeError('transfer',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 520 char 1',
                                     'Bytes<32>',
                                     to_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('transfer',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 520 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(caller_0).concat(_descriptor_0.toValue(to_0).concat(_descriptor_3.toValue(value_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._transfer_0(context,
                                          partialProofData,
                                          caller_0,
                                          to_0,
                                          value_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      approve: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`approve: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const caller_0 = args_1[1];
        const spender_0 = args_1[2];
        const value_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('approve',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 531 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(caller_0.buffer instanceof ArrayBuffer && caller_0.BYTES_PER_ELEMENT === 1 && caller_0.length === 32)) {
          __compactRuntime.typeError('approve',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 531 char 1',
                                     'Bytes<32>',
                                     caller_0)
        }
        if (!(spender_0.buffer instanceof ArrayBuffer && spender_0.BYTES_PER_ELEMENT === 1 && spender_0.length === 32)) {
          __compactRuntime.typeError('approve',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 531 char 1',
                                     'Bytes<32>',
                                     spender_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('approve',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 531 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(caller_0).concat(_descriptor_0.toValue(spender_0).concat(_descriptor_3.toValue(value_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._approve_0(context,
                                         partialProofData,
                                         caller_0,
                                         spender_0,
                                         value_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      transferFrom: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`transferFrom: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const caller_0 = args_1[1];
        const fromAccount_0 = args_1[2];
        const to_0 = args_1[3];
        const value_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('transferFrom',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 542 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(caller_0.buffer instanceof ArrayBuffer && caller_0.BYTES_PER_ELEMENT === 1 && caller_0.length === 32)) {
          __compactRuntime.typeError('transferFrom',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 542 char 1',
                                     'Bytes<32>',
                                     caller_0)
        }
        if (!(fromAccount_0.buffer instanceof ArrayBuffer && fromAccount_0.BYTES_PER_ELEMENT === 1 && fromAccount_0.length === 32)) {
          __compactRuntime.typeError('transferFrom',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 542 char 1',
                                     'Bytes<32>',
                                     fromAccount_0)
        }
        if (!(to_0.buffer instanceof ArrayBuffer && to_0.BYTES_PER_ELEMENT === 1 && to_0.length === 32)) {
          __compactRuntime.typeError('transferFrom',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 542 char 1',
                                     'Bytes<32>',
                                     to_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('transferFrom',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 542 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(caller_0).concat(_descriptor_0.toValue(fromAccount_0).concat(_descriptor_0.toValue(to_0).concat(_descriptor_3.toValue(value_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._transferFrom_0(context,
                                              partialProofData,
                                              caller_0,
                                              fromAccount_0,
                                              to_0,
                                              value_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      selfBurn: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`selfBurn: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const caller_0 = args_1[1];
        const value_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('selfBurn',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 558 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(caller_0.buffer instanceof ArrayBuffer && caller_0.BYTES_PER_ELEMENT === 1 && caller_0.length === 32)) {
          __compactRuntime.typeError('selfBurn',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 558 char 1',
                                     'Bytes<32>',
                                     caller_0)
        }
        if (!(typeof(value_0) === 'bigint' && value_0 >= 0n && value_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('selfBurn',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 558 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     value_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(caller_0).concat(_descriptor_3.toValue(value_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._selfBurn_0(context,
                                          partialProofData,
                                          caller_0,
                                          value_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      emergencyWithdraw: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`emergencyWithdraw: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const caller_0 = args_1[1];
        const amount_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('emergencyWithdraw',
                                     'argument 1 (as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 589 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(caller_0.buffer instanceof ArrayBuffer && caller_0.BYTES_PER_ELEMENT === 1 && caller_0.length === 32)) {
          __compactRuntime.typeError('emergencyWithdraw',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 589 char 1',
                                     'Bytes<32>',
                                     caller_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 340282366920938463463374607431768211455n)) {
          __compactRuntime.typeError('emergencyWithdraw',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'fungible_token_v2.6.compact line 589 char 1',
                                     'Uint<0..340282366920938463463374607431768211456>',
                                     amount_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(caller_0).concat(_descriptor_3.toValue(amount_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_3.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._emergencyWithdraw_0(context,
                                                   partialProofData,
                                                   caller_0,
                                                   amount_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      mint: this.circuits.mint,
      burn: this.circuits.burn,
      setEmergencyPauser: this.circuits.setEmergencyPauser,
      adminReallocate: this.circuits.adminReallocate,
      rotateSigner: this.circuits.rotateSigner,
      pause: this.circuits.pause,
      unpause: this.circuits.unpause,
      transfer: this.circuits.transfer,
      approve: this.circuits.approve,
      transferFrom: this.circuits.transferFrom,
      selfBurn: this.circuits.selfBurn,
      emergencyWithdraw: this.circuits.emergencyWithdraw
    };
    this.provableCircuits = {
      mint: this.circuits.mint,
      burn: this.circuits.burn,
      setEmergencyPauser: this.circuits.setEmergencyPauser,
      adminReallocate: this.circuits.adminReallocate,
      rotateSigner: this.circuits.rotateSigner,
      pause: this.circuits.pause,
      unpause: this.circuits.unpause,
      transfer: this.circuits.transfer,
      approve: this.circuits.approve,
      transferFrom: this.circuits.transferFrom,
      selfBurn: this.circuits.selfBurn,
      emergencyWithdraw: this.circuits.emergencyWithdraw
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 9) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 9 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const salt__0 = args_0[1];
    const initialOwner_0 = args_0[2];
    const name__0 = args_0[3];
    const symbol__0 = args_0[4];
    const decimals__0 = args_0[5];
    const maxSupply__0 = args_0[6];
    const initialSigners_0 = args_0[7];
    const threshold__0 = args_0[8];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(salt__0.buffer instanceof ArrayBuffer && salt__0.BYTES_PER_ELEMENT === 1 && salt__0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'fungible_token_v2.6.compact line 244 char 1',
                                 'Bytes<32>',
                                 salt__0)
    }
    if (!(initialOwner_0.buffer instanceof ArrayBuffer && initialOwner_0.BYTES_PER_ELEMENT === 1 && initialOwner_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 2 (argument 3 as invoked from Typescript)',
                                 'fungible_token_v2.6.compact line 244 char 1',
                                 'Bytes<32>',
                                 initialOwner_0)
    }
    if (!(typeof(decimals__0) === 'bigint' && decimals__0 >= 0n && decimals__0 <= 255n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 5 (argument 6 as invoked from Typescript)',
                                 'fungible_token_v2.6.compact line 244 char 1',
                                 'Uint<0..256>',
                                 decimals__0)
    }
    if (!(typeof(maxSupply__0) === 'bigint' && maxSupply__0 >= 0n && maxSupply__0 <= 340282366920938463463374607431768211455n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 6 (argument 7 as invoked from Typescript)',
                                 'fungible_token_v2.6.compact line 244 char 1',
                                 'Uint<0..340282366920938463463374607431768211456>',
                                 maxSupply__0)
    }
    if (!(Array.isArray(initialSigners_0) && initialSigners_0.length === 3 && initialSigners_0.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 32))) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 7 (argument 8 as invoked from Typescript)',
                                 'fungible_token_v2.6.compact line 244 char 1',
                                 'Vector<3, Bytes<32>>',
                                 initialSigners_0)
    }
    if (!(typeof(threshold__0) === 'bigint' && threshold__0 >= 0n && threshold__0 <= 255n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 8 (argument 9 as invoked from Typescript)',
                                 'fungible_token_v2.6.compact line 244 char 1',
                                 'Uint<0..256>',
                                 threshold__0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('mint', new __compactRuntime.ContractOperation());
    state_0.setOperation('burn', new __compactRuntime.ContractOperation());
    state_0.setOperation('setEmergencyPauser', new __compactRuntime.ContractOperation());
    state_0.setOperation('adminReallocate', new __compactRuntime.ContractOperation());
    state_0.setOperation('rotateSigner', new __compactRuntime.ContractOperation());
    state_0.setOperation('pause', new __compactRuntime.ContractOperation());
    state_0.setOperation('unpause', new __compactRuntime.ContractOperation());
    state_0.setOperation('transfer', new __compactRuntime.ContractOperation());
    state_0.setOperation('approve', new __compactRuntime.ContractOperation());
    state_0.setOperation('transferFrom', new __compactRuntime.ContractOperation());
    state_0.setOperation('selfBurn', new __compactRuntime.ContractOperation());
    state_0.setOperation('emergencyWithdraw', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(1n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(2n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(3n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(0n),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(4n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_23.toValue(''),
                                                                                              alignment: _descriptor_23.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(5n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_23.toValue(''),
                                                                                              alignment: _descriptor_23.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(6n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(7n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(8n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(9n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(false),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(10n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(11n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(12n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(13n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(14n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const MAX_UINT128_0 = 340282366920938463463374607431768211455n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(8n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(salt__0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(7n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(initialOwner_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(4n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_23.toValue(name__0),
                                                                                              alignment: _descriptor_23.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(5n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_23.toValue(symbol__0),
                                                                                              alignment: _descriptor_23.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(6n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(decimals__0),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(2n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    if (this._equal_0(maxSupply__0, 0n)) {
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(3n),
                                                                                                alignment: _descriptor_13.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(MAX_UINT128_0),
                                                                                                alignment: _descriptor_3.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } }]);
    } else {
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(3n),
                                                                                                alignment: _descriptor_13.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(maxSupply__0),
                                                                                                alignment: _descriptor_3.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } }]);
    }
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(9n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(false),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(10n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(initialOwner_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.assert(threshold__0 >= 1n && threshold__0 <= 3n,
                            'FungibleToken: invalid threshold');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(12n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(threshold__0),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_1 = 3n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(13n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(tmp_1),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    this._folder_0(context,
                   partialProofData,
                   ((context, partialProofData, t_0, s_0) =>
                    {
                      __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                         partialProofData,
                                                                                                         [
                                                                                                          { dup: { n: 0 } },
                                                                                                          { idx: { cached: false,
                                                                                                                   pushPath: false,
                                                                                                                   path: [
                                                                                                                          { tag: 'value',
                                                                                                                            value: { value: _descriptor_13.toValue(11n),
                                                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                                                          { push: { storage: false,
                                                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(s_0),
                                                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                                                          'member',
                                                                                                          { popeq: { cached: true,
                                                                                                                     result: undefined } }]).value),
                                              'FungibleToken: duplicate initial signer');
                      __compactRuntime.queryLedgerState(context,
                                                        partialProofData,
                                                        [
                                                         { idx: { cached: false,
                                                                  pushPath: true,
                                                                  path: [
                                                                         { tag: 'value',
                                                                           value: { value: _descriptor_13.toValue(11n),
                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                         { push: { storage: false,
                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(s_0),
                                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                                         { push: { storage: true,
                                                                   value: __compactRuntime.StateValue.newNull().encode() } },
                                                         { ins: { cached: false,
                                                                  n: 1 } },
                                                         { ins: { cached: true,
                                                                  n: 1 } }]);
                      return t_0;
                    }),
                   [],
                   initialSigners_0);
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
    const result_0 = __compactRuntime.transientHash(_descriptor_20, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_21, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_18, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_19, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_2, value_0);
    return result_0;
  }
  _persistentHash_4(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_17, value_0);
    return result_0;
  }
  _persistentHash_5(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_16, value_0);
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
  _getSchnorrReduction_0(context, partialProofData, challengeHash_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getSchnorrReduction(witnessContext_0,
                                                                              challengeHash_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 2  && typeof(result_0[0]) === 'bigint' && result_0[0] >= 0 && result_0[0] <= __compactRuntime.MAX_FIELD && typeof(result_0[1]) === 'bigint' && result_0[1] >= 0n && result_0[1] <= 452312848583266388373324160190187140051835877600158453279131187530910662655n)) {
      __compactRuntime.typeError('getSchnorrReduction',
                                 'return value',
                                 'fungible_token_v2.6.compact line 51 char 1',
                                 '[Field, Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_15.toValue(result_0),
      alignment: _descriptor_15.alignment()
    });
    return result_0;
  }
  _schnorrVerify_0(context, partialProofData, msg_0, signature_0, pk_0) {
    const __compact_pattern_tmp2_0 = signature_0;
    const announcement_0 = __compact_pattern_tmp2_0.announcement;
    const response_0 = __compact_pattern_tmp2_0.response;
    const cFull_0 = this._transientHash_1({ ann_x:
                                              this._jubjubPointX_0(announcement_0),
                                            ann_y:
                                              this._jubjubPointY_0(announcement_0),
                                            pk_x: this._jubjubPointX_0(pk_0),
                                            pk_y: this._jubjubPointY_0(pk_0),
                                            msg: msg_0 });
    const TWO_248_0 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
    const __compact_pattern_tmp1_0 = this._getSchnorrReduction_0(context,
                                                                 partialProofData,
                                                                 cFull_0);
    const q_0 = __compact_pattern_tmp1_0[0];
    const cTruncated_0 = __compact_pattern_tmp1_0[1];
    __compactRuntime.assert(__compactRuntime.addField(__compactRuntime.mulField(q_0,
                                                                                TWO_248_0),
                                                      cTruncated_0)
                            ===
                            cFull_0,
                            'FungibleToken: invalid challenge reduction');
    const c_0 = cTruncated_0;
    const lhs_0 = this._ecMulGenerator_0(response_0);
    const rhs_0 = this._ecAdd_0(announcement_0, this._ecMul_0(pk_0, c_0));
    __compactRuntime.assert(this._jubjubPointX_0(lhs_0)
                            ===
                            this._jubjubPointX_0(rhs_0)
                            &&
                            this._jubjubPointY_0(lhs_0)
                            ===
                            this._jubjubPointY_0(rhs_0),
                            'FungibleToken: invalid signature');
    return [];
  }
  _localSecretKey_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.localSecretKey(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('localSecretKey',
                                 'return value',
                                 'fungible_token_v2.6.compact line 108 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _authenticate_0(context, partialProofData, account_0) {
    const sk_0 = this._localSecretKey_0(context, partialProofData);
    const domainTag_0 = new Uint8Array([102, 117, 110, 103, 105, 98, 108, 101, 45, 116, 111, 107, 101, 110, 58, 97, 117, 116, 104, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const derivedAccount_0 = this._persistentHash_5([domainTag_0,
                                                     _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                               partialProofData,
                                                                                                               [
                                                                                                                { dup: { n: 0 } },
                                                                                                                { idx: { cached: false,
                                                                                                                         pushPath: false,
                                                                                                                         path: [
                                                                                                                                { tag: 'value',
                                                                                                                                  value: { value: _descriptor_13.toValue(8n),
                                                                                                                                           alignment: _descriptor_13.alignment() } }] } },
                                                                                                                { popeq: { cached: false,
                                                                                                                           result: undefined } }]).value),
                                                     sk_0]);
    __compactRuntime.assert(this._equal_1(derivedAccount_0, account_0),
                            'FungibleToken: caller authorization failed');
    return [];
  }
  _whenNotPaused_0(context, partialProofData) {
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_13.toValue(9n),
                                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value),
                            'FungibleToken: contract is paused');
    return [];
  }
  _whenPaused_0(context, partialProofData) {
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_13.toValue(9n),
                                                                                                                  alignment: _descriptor_13.alignment() } }] } },
                                                                                       { popeq: { cached: false,
                                                                                                  result: undefined } }]).value),
                            'FungibleToken: contract is not paused');
    return [];
  }
  _onlyOwner_0(context, partialProofData, account_0) {
    this._authenticate_0(context, partialProofData, account_0);
    __compactRuntime.assert(this._equal_2(account_0,
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_13.toValue(7n),
                                                                                                                                alignment: _descriptor_13.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'FungibleToken: only owner can call this');
    return [];
  }
  _onlyPauser_0(context, partialProofData, account_0) {
    this._authenticate_0(context, partialProofData, account_0);
    __compactRuntime.assert(this._equal_3(account_0,
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_13.toValue(10n),
                                                                                                                                alignment: _descriptor_13.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value))
                            ||
                            this._equal_4(account_0,
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_13.toValue(7n),
                                                                                                                                alignment: _descriptor_13.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'FungibleToken: only pauser or owner can call this');
    return [];
  }
  _calculateSignerCommitment_0(pk_0, salt_0) {
    return this._persistentHash_0([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 115, 105, 103, 110, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   salt_0,
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        this._jubjubPointX_0(pk_0),
                                                                        'fungible_token_v2.6.compact line 157 char 5'),
                                   __compactRuntime.convertFieldToBytes(32,
                                                                        this._jubjubPointY_0(pk_0),
                                                                        'fungible_token_v2.6.compact line 158 char 5')]);
  }
  _isZeroPoint_0(pk_0) {
    return this._jubjubPointX_0(pk_0) === 0n
           &&
           this._jubjubPointY_0(pk_0) === 0n;
  }
  _assertDistinctPair_0(a_0, b_0) {
    if (!this._isZeroPoint_0(a_0) && !this._isZeroPoint_0(b_0)) {
      __compactRuntime.assert(this._jubjubPointX_0(a_0)
                              !==
                              this._jubjubPointX_0(b_0)
                              ||
                              this._jubjubPointY_0(a_0)
                              !==
                              this._jubjubPointY_0(b_0),
                              'FungibleToken: duplicate signer detected');
    }
    return [];
  }
  _assertApprovals_0(context,
                     partialProofData,
                     msgHash_0,
                     pubkeys_0,
                     signatures_0)
  {
    this._assertDistinctPair_0(pubkeys_0[0], pubkeys_0[1]);
    this._assertDistinctPair_0(pubkeys_0[0], pubkeys_0[2]);
    this._assertDistinctPair_0(pubkeys_0[1], pubkeys_0[2]);
    const msgVec_0 = [this._transientHash_0(msgHash_0)];
    const validCount0_0 = this._checkApprovalSlot_0(context,
                                                    partialProofData,
                                                    pubkeys_0[0],
                                                    signatures_0[0],
                                                    msgVec_0);
    const validCount1_0 = this._checkApprovalSlot_0(context,
                                                    partialProofData,
                                                    pubkeys_0[1],
                                                    signatures_0[1],
                                                    msgVec_0);
    const validCount2_0 = this._checkApprovalSlot_0(context,
                                                    partialProofData,
                                                    pubkeys_0[2],
                                                    signatures_0[2],
                                                    msgVec_0);
    const validCount_0 = ((t1) => {
                           if (t1 > 255n) {
                             throw new __compactRuntime.CompactError('fungible_token_v2.6.compact line 217 char 31: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
                           }
                           return t1;
                         })(validCount0_0 + validCount1_0 + validCount2_0);
    __compactRuntime.assert(validCount_0
                            >=
                            _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_13.toValue(12n),
                                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value),
                            'FungibleToken: threshold not met');
    return [];
  }
  _checkApprovalSlot_0(context, partialProofData, pk_0, signature_0, msgVec_0) {
    let comm_0;
    return this._isZeroPoint_0(pk_0) ?
           0n :
           (comm_0 = this._calculateSignerCommitment_0(pk_0,
                                                       _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                 partialProofData,
                                                                                                                 [
                                                                                                                  { dup: { n: 0 } },
                                                                                                                  { idx: { cached: false,
                                                                                                                           pushPath: false,
                                                                                                                           path: [
                                                                                                                                  { tag: 'value',
                                                                                                                                    value: { value: _descriptor_13.toValue(8n),
                                                                                                                                             alignment: _descriptor_13.alignment() } }] } },
                                                                                                                  { popeq: { cached: false,
                                                                                                                             result: undefined } }]).value)),
            (__compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                               partialProofData,
                                                                                               [
                                                                                                { dup: { n: 0 } },
                                                                                                { idx: { cached: false,
                                                                                                         pushPath: false,
                                                                                                         path: [
                                                                                                                { tag: 'value',
                                                                                                                  value: { value: _descriptor_13.toValue(11n),
                                                                                                                           alignment: _descriptor_13.alignment() } }] } },
                                                                                                { push: { storage: false,
                                                                                                          value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(comm_0),
                                                                                                                                                       alignment: _descriptor_0.alignment() }).encode() } },
                                                                                                'member',
                                                                                                { popeq: { cached: true,
                                                                                                           result: undefined } }]).value),
                                     'FungibleToken: signer not registered'),
             this._schnorrVerify_0(context,
                                   partialProofData,
                                   msgVec_0,
                                   signature_0,
                                   pk_0),
             1n));
  }
  _balanceOf_0(context, partialProofData, account_0) {
    if (!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_13.toValue(0n),
                                                                                               alignment: _descriptor_13.alignment() } }] } },
                                                                    { push: { storage: false,
                                                                              value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(account_0),
                                                                                                                           alignment: _descriptor_0.alignment() }).encode() } },
                                                                    'member',
                                                                    { popeq: { cached: true,
                                                                               result: undefined } }]).value))
    {
      return 0n;
    } else {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_13.toValue(0n),
                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_0.toValue(account_0),
                                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  }
  _allowance_0(context, partialProofData, ownerAccount_0, spender_0) {
    const allowanceKey_0 = [ownerAccount_0, spender_0];
    if (!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_13.toValue(1n),
                                                                                               alignment: _descriptor_13.alignment() } }] } },
                                                                    { push: { storage: false,
                                                                              value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(allowanceKey_0),
                                                                                                                           alignment: _descriptor_2.alignment() }).encode() } },
                                                                    'member',
                                                                    { popeq: { cached: true,
                                                                               result: undefined } }]).value))
    {
      return 0n;
    } else {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_13.toValue(1n),
                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_2.toValue(allowanceKey_0),
                                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  }
  _mint_0(context, partialProofData, to_0, value_0, pubkeys_0, signatures_0) {
    this._whenNotPaused_0(context, partialProofData);
    __compactRuntime.assert(!this._isZeroKey_0(to_0),
                            'FungibleToken: invalid receiver');
    const opNonce_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_13.toValue(14n),
                                                                                                            alignment: _descriptor_13.alignment() } }] } },
                                                                                 { popeq: { cached: true,
                                                                                            result: undefined } }]).value);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_13.toValue(14n),
                                                                  alignment: _descriptor_13.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_5.toValue(tmp_0),
                                                                alignment: _descriptor_5.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const msgHash_0 = this._persistentHash_2([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 109, 105, 110, 116, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                              _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                        partialProofData,
                                                                                                        [
                                                                                                         { dup: { n: 2 } },
                                                                                                         { idx: { cached: true,
                                                                                                                  pushPath: false,
                                                                                                                  path: [
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_13.toValue(0n),
                                                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                                                         { popeq: { cached: true,
                                                                                                                    result: undefined } }]).value).bytes,
                                              __compactRuntime.convertFieldToBytes(32,
                                                                                   opNonce_0,
                                                                                   'fungible_token_v2.6.compact line 323 char 5'),
                                              to_0,
                                              __compactRuntime.convertFieldToBytes(32,
                                                                                   value_0,
                                                                                   'fungible_token_v2.6.compact line 325 char 5')]);
    this._assertApprovals_0(context,
                            partialProofData,
                            msgHash_0,
                            pubkeys_0,
                            signatures_0);
    this.__mint_0(context, partialProofData, to_0, value_0);
    return true;
  }
  _burn_0(context, partialProofData, account_0, value_0, pubkeys_0, signatures_0)
  {
    this._whenNotPaused_0(context, partialProofData);
    __compactRuntime.assert(!this._isZeroKey_0(account_0),
                            'FungibleToken: invalid sender');
    __compactRuntime.assert(this._equal_5(account_0,
                                          _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_13.toValue(7n),
                                                                                                                                alignment: _descriptor_13.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'FungibleToken: multi-sig burn restricted to owner/treasury account');
    const opNonce_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_13.toValue(14n),
                                                                                                            alignment: _descriptor_13.alignment() } }] } },
                                                                                 { popeq: { cached: true,
                                                                                            result: undefined } }]).value);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_13.toValue(14n),
                                                                  alignment: _descriptor_13.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_5.toValue(tmp_0),
                                                                alignment: _descriptor_5.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const msgHash_0 = this._persistentHash_2([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 98, 117, 114, 110, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                              _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                        partialProofData,
                                                                                                        [
                                                                                                         { dup: { n: 2 } },
                                                                                                         { idx: { cached: true,
                                                                                                                  pushPath: false,
                                                                                                                  path: [
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_13.toValue(0n),
                                                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                                                         { popeq: { cached: true,
                                                                                                                    result: undefined } }]).value).bytes,
                                              __compactRuntime.convertFieldToBytes(32,
                                                                                   opNonce_0,
                                                                                   'fungible_token_v2.6.compact line 356 char 5'),
                                              account_0,
                                              __compactRuntime.convertFieldToBytes(32,
                                                                                   value_0,
                                                                                   'fungible_token_v2.6.compact line 358 char 5')]);
    this._assertApprovals_0(context,
                            partialProofData,
                            msgHash_0,
                            pubkeys_0,
                            signatures_0);
    this.__burn_0(context, partialProofData, account_0, value_0);
    return true;
  }
  _setEmergencyPauser_0(context,
                        partialProofData,
                        newPauser_0,
                        pubkeys_0,
                        signatures_0)
  {
    __compactRuntime.assert(!this._isZeroKey_0(newPauser_0),
                            'FungibleToken: invalid pauser address');
    const opNonce_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_13.toValue(14n),
                                                                                                            alignment: _descriptor_13.alignment() } }] } },
                                                                                 { popeq: { cached: true,
                                                                                            result: undefined } }]).value);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_13.toValue(14n),
                                                                  alignment: _descriptor_13.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_5.toValue(tmp_0),
                                                                alignment: _descriptor_5.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const msgHash_0 = this._persistentHash_0([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 115, 101, 116, 45, 112, 97, 117, 115, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                              _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                        partialProofData,
                                                                                                        [
                                                                                                         { dup: { n: 2 } },
                                                                                                         { idx: { cached: true,
                                                                                                                  pushPath: false,
                                                                                                                  path: [
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_13.toValue(0n),
                                                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                                                         { popeq: { cached: true,
                                                                                                                    result: undefined } }]).value).bytes,
                                              __compactRuntime.convertFieldToBytes(32,
                                                                                   opNonce_0,
                                                                                   'fungible_token_v2.6.compact line 384 char 5'),
                                              newPauser_0]);
    this._assertApprovals_0(context,
                            partialProofData,
                            msgHash_0,
                            pubkeys_0,
                            signatures_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(10n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newPauser_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return true;
  }
  _adminReallocate_0(context,
                     partialProofData,
                     trappedAccount_0,
                     targetSpendableAccount_0,
                     amount_0,
                     pubkeys_0,
                     signatures_0)
  {
    this._whenNotPaused_0(context, partialProofData);
    const opNonce_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_13.toValue(14n),
                                                                                                            alignment: _descriptor_13.alignment() } }] } },
                                                                                 { popeq: { cached: true,
                                                                                            result: undefined } }]).value);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_13.toValue(14n),
                                                                  alignment: _descriptor_13.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_5.toValue(tmp_0),
                                                                alignment: _descriptor_5.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const msgHash_0 = this._persistentHash_1([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 114, 101, 97, 108, 108, 111, 99, 97, 116, 101, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                              _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                        partialProofData,
                                                                                                        [
                                                                                                         { dup: { n: 2 } },
                                                                                                         { idx: { cached: true,
                                                                                                                  pushPath: false,
                                                                                                                  path: [
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_13.toValue(0n),
                                                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                                                         { popeq: { cached: true,
                                                                                                                    result: undefined } }]).value).bytes,
                                              __compactRuntime.convertFieldToBytes(32,
                                                                                   opNonce_0,
                                                                                   'fungible_token_v2.6.compact line 419 char 5'),
                                              trappedAccount_0,
                                              targetSpendableAccount_0,
                                              __compactRuntime.convertFieldToBytes(32,
                                                                                   amount_0,
                                                                                   'fungible_token_v2.6.compact line 422 char 5')]);
    this._assertApprovals_0(context,
                            partialProofData,
                            msgHash_0,
                            pubkeys_0,
                            signatures_0);
    this.__transfer_0(context,
                      partialProofData,
                      trappedAccount_0,
                      targetSpendableAccount_0,
                      amount_0);
    return true;
  }
  _rotateSigner_0(context,
                  partialProofData,
                  oldSignerCommitment_0,
                  newSignerPubkey_0,
                  newSignerPop_0,
                  pubkeys_0,
                  signatures_0)
  {
    __compactRuntime.assert(!this._isZeroPoint_0(newSignerPubkey_0),
                            'FungibleToken: invalid new signer');
    const newSignerCommitment_0 = this._calculateSignerCommitment_0(newSignerPubkey_0,
                                                                    _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                              partialProofData,
                                                                                                                              [
                                                                                                                               { dup: { n: 0 } },
                                                                                                                               { idx: { cached: false,
                                                                                                                                        pushPath: false,
                                                                                                                                        path: [
                                                                                                                                               { tag: 'value',
                                                                                                                                                 value: { value: _descriptor_13.toValue(8n),
                                                                                                                                                          alignment: _descriptor_13.alignment() } }] } },
                                                                                                                               { popeq: { cached: false,
                                                                                                                                          result: undefined } }]).value));
    __compactRuntime.assert(_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_13.toValue(11n),
                                                                                                                  alignment: _descriptor_13.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(oldSignerCommitment_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'FungibleToken: old signer not registered');
    __compactRuntime.assert(!_descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_13.toValue(11n),
                                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newSignerCommitment_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'FungibleToken: new signer already registered');
    const opNonce_0 = _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_13.toValue(14n),
                                                                                                            alignment: _descriptor_13.alignment() } }] } },
                                                                                 { popeq: { cached: true,
                                                                                            result: undefined } }]).value);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_13.toValue(14n),
                                                                  alignment: _descriptor_13.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_5.toValue(tmp_0),
                                                                alignment: _descriptor_5.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const msgHash_0 = this._persistentHash_2([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 114, 111, 116, 97, 116, 101, 45, 115, 105, 103, 110, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                              _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                        partialProofData,
                                                                                                        [
                                                                                                         { dup: { n: 2 } },
                                                                                                         { idx: { cached: true,
                                                                                                                  pushPath: false,
                                                                                                                  path: [
                                                                                                                         { tag: 'value',
                                                                                                                           value: { value: _descriptor_13.toValue(0n),
                                                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                                                         { popeq: { cached: true,
                                                                                                                    result: undefined } }]).value).bytes,
                                              __compactRuntime.convertFieldToBytes(32,
                                                                                   opNonce_0,
                                                                                   'fungible_token_v2.6.compact line 473 char 5'),
                                              oldSignerCommitment_0,
                                              newSignerCommitment_0]);
    this._assertApprovals_0(context,
                            partialProofData,
                            msgHash_0,
                            pubkeys_0,
                            signatures_0);
    const popDigest_0 = this._persistentHash_3([new Uint8Array([109, 117, 108, 116, 105, 115, 105, 103, 58, 114, 111, 116, 97, 116, 101, 45, 112, 111, 112, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                msgHash_0]);
    const popMsg_0 = [this._transientHash_0(popDigest_0)];
    this._schnorrVerify_0(context,
                          partialProofData,
                          popMsg_0,
                          newSignerPop_0,
                          newSignerPubkey_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_13.toValue(11n),
                                                                  alignment: _descriptor_13.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(oldSignerCommitment_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_13.toValue(11n),
                                                                  alignment: _descriptor_13.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newSignerCommitment_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return true;
  }
  _pause_0(context, partialProofData, caller_0) {
    this._onlyPauser_0(context, partialProofData, caller_0);
    this._whenNotPaused_0(context, partialProofData);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(9n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(true),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return true;
  }
  _unpause_0(context, partialProofData, caller_0) {
    this._onlyPauser_0(context, partialProofData, caller_0);
    this._whenPaused_0(context, partialProofData);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(9n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(false),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return true;
  }
  _transfer_0(context, partialProofData, caller_0, to_0, value_0) {
    this._authenticate_0(context, partialProofData, caller_0);
    this._whenNotPaused_0(context, partialProofData);
    this.__transfer_0(context, partialProofData, caller_0, to_0, value_0);
    return true;
  }
  _approve_0(context, partialProofData, caller_0, spender_0, value_0) {
    this._authenticate_0(context, partialProofData, caller_0);
    this._whenNotPaused_0(context, partialProofData);
    this.__approve_0(context, partialProofData, caller_0, spender_0, value_0);
    return true;
  }
  _transferFrom_0(context,
                  partialProofData,
                  caller_0,
                  fromAccount_0,
                  to_0,
                  value_0)
  {
    this._authenticate_0(context, partialProofData, caller_0);
    this._whenNotPaused_0(context, partialProofData);
    this.__spendAllowance_0(context,
                            partialProofData,
                            fromAccount_0,
                            caller_0,
                            value_0);
    this.__transfer_0(context, partialProofData, fromAccount_0, to_0, value_0);
    return true;
  }
  _selfBurn_0(context, partialProofData, caller_0, value_0) {
    this._authenticate_0(context, partialProofData, caller_0);
    this._whenNotPaused_0(context, partialProofData);
    this.__burn_0(context, partialProofData, caller_0, value_0);
    return true;
  }
  __contractAccount_0(context, partialProofData) {
    const domainTag_0 = new Uint8Array([102, 117, 110, 103, 105, 98, 108, 101, 45, 116, 111, 107, 101, 110, 58, 99, 111, 110, 116, 114, 97, 99, 116, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    return this._persistentHash_4([domainTag_0,
                                   _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                             partialProofData,
                                                                                             [
                                                                                              { dup: { n: 2 } },
                                                                                              { idx: { cached: true,
                                                                                                       pushPath: false,
                                                                                                       path: [
                                                                                                              { tag: 'value',
                                                                                                                value: { value: _descriptor_13.toValue(0n),
                                                                                                                         alignment: _descriptor_13.alignment() } }] } },
                                                                                              { popeq: { cached: true,
                                                                                                         result: undefined } }]).value)]);
  }
  _emergencyWithdraw_0(context, partialProofData, caller_0, amount_0) {
    this._onlyOwner_0(context, partialProofData, caller_0);
    this._whenPaused_0(context, partialProofData);
    const fromAccount_0 = this.__contractAccount_0(context, partialProofData);
    const recipient_0 = _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_13.toValue(7n),
                                                                                                              alignment: _descriptor_13.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value);
    this.__transfer_0(context,
                      partialProofData,
                      fromAccount_0,
                      recipient_0,
                      amount_0);
    return true;
  }
  __transfer_0(context, partialProofData, fromAccount_0, to_0, value_0) {
    __compactRuntime.assert(!this._isZeroKey_0(fromAccount_0),
                            'FungibleToken: invalid sender');
    __compactRuntime.assert(!this._isZeroKey_0(to_0),
                            'FungibleToken: invalid receiver');
    if (this._equal_6(fromAccount_0, to_0)) {
      const bal_0 = this._balanceOf_0(context, partialProofData, fromAccount_0);
      __compactRuntime.assert(bal_0 >= value_0,
                              'FungibleToken: insufficient balance');
      return [];
    } else {
      this.__update_0(context, partialProofData, fromAccount_0, to_0, value_0);
      return [];
    }
  }
  __update_0(context, partialProofData, fromAccount_0, to_0, value_0) {
    if (this._isZeroKey_0(fromAccount_0)) {
      let t_1, t_2, t_0;
      __compactRuntime.assert((t_1 = (t_2 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                      partialProofData,
                                                                                                      [
                                                                                                       { dup: { n: 0 } },
                                                                                                       { idx: { cached: false,
                                                                                                                pushPath: false,
                                                                                                                path: [
                                                                                                                       { tag: 'value',
                                                                                                                         value: { value: _descriptor_13.toValue(3n),
                                                                                                                                  alignment: _descriptor_13.alignment() } }] } },
                                                                                                       { popeq: { cached: false,
                                                                                                                  result: undefined } }]).value),
                                      (t_0 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                       partialProofData,
                                                                                                       [
                                                                                                        { dup: { n: 0 } },
                                                                                                        { idx: { cached: false,
                                                                                                                 pushPath: false,
                                                                                                                 path: [
                                                                                                                        { tag: 'value',
                                                                                                                          value: { value: _descriptor_13.toValue(2n),
                                                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                                                        { popeq: { cached: false,
                                                                                                                   result: undefined } }]).value),
                                       (__compactRuntime.assert(t_2 >= t_0,
                                                                'result of subtraction would be negative'),
                                        t_2 - t_0))),
                               t_1 >= value_0),
                              'FungibleToken: supply overflow');
      const tmp_0 = ((t1) => {
                      if (t1 > 340282366920938463463374607431768211455n) {
                        throw new __compactRuntime.CompactError('fungible_token_v2.6.compact line 625 char 20: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
                      }
                      return t1;
                    })(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                 partialProofData,
                                                                                 [
                                                                                  { dup: { n: 0 } },
                                                                                  { idx: { cached: false,
                                                                                           pushPath: false,
                                                                                           path: [
                                                                                                  { tag: 'value',
                                                                                                    value: { value: _descriptor_13.toValue(2n),
                                                                                                             alignment: _descriptor_13.alignment() } }] } },
                                                                                  { popeq: { cached: false,
                                                                                             result: undefined } }]).value)
                       +
                       value_0);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(2n),
                                                                                                alignment: _descriptor_13.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_0),
                                                                                                alignment: _descriptor_3.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } }]);
    } else {
      const fromBal_0 = this._balanceOf_0(context,
                                          partialProofData,
                                          fromAccount_0);
      __compactRuntime.assert(fromBal_0 >= value_0,
                              'FungibleToken: insufficient balance');
      let t_3;
      const tmp_1 = (t_3 = value_0,
                     (__compactRuntime.assert(fromBal_0 >= t_3,
                                              'result of subtraction would be negative'),
                      fromBal_0 - t_3));
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_13.toValue(0n),
                                                                    alignment: _descriptor_13.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(fromAccount_0),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_1),
                                                                                                alignment: _descriptor_3.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 1 } }]);
    }
    if (this._isZeroKey_0(to_0)) {
      let t_4;
      __compactRuntime.assert((t_4 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                               partialProofData,
                                                                                               [
                                                                                                { dup: { n: 0 } },
                                                                                                { idx: { cached: false,
                                                                                                         pushPath: false,
                                                                                                         path: [
                                                                                                                { tag: 'value',
                                                                                                                  value: { value: _descriptor_13.toValue(2n),
                                                                                                                           alignment: _descriptor_13.alignment() } }] } },
                                                                                                { popeq: { cached: false,
                                                                                                           result: undefined } }]).value),
                               t_4 >= value_0),
                              'FungibleToken: supply underflow');
      let t_5, t_6;
      const tmp_2 = (t_5 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                     partialProofData,
                                                                                     [
                                                                                      { dup: { n: 0 } },
                                                                                      { idx: { cached: false,
                                                                                               pushPath: false,
                                                                                               path: [
                                                                                                      { tag: 'value',
                                                                                                        value: { value: _descriptor_13.toValue(2n),
                                                                                                                 alignment: _descriptor_13.alignment() } }] } },
                                                                                      { popeq: { cached: false,
                                                                                                 result: undefined } }]).value),
                     (t_6 = value_0,
                      (__compactRuntime.assert(t_5 >= t_6,
                                               'result of subtraction would be negative'),
                       t_5 - t_6)));
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(2n),
                                                                                                alignment: _descriptor_13.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_2),
                                                                                                alignment: _descriptor_3.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } }]);
    } else {
      const toBal_0 = this._balanceOf_0(context, partialProofData, to_0);
      let t_7, t_8;
      __compactRuntime.assert((t_7 = (t_8 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                      partialProofData,
                                                                                                      [
                                                                                                       { dup: { n: 0 } },
                                                                                                       { idx: { cached: false,
                                                                                                                pushPath: false,
                                                                                                                path: [
                                                                                                                       { tag: 'value',
                                                                                                                         value: { value: _descriptor_13.toValue(3n),
                                                                                                                                  alignment: _descriptor_13.alignment() } }] } },
                                                                                                       { popeq: { cached: false,
                                                                                                                  result: undefined } }]).value),
                                      (__compactRuntime.assert(t_8 >= toBal_0,
                                                               'result of subtraction would be negative'),
                                       t_8 - toBal_0)),
                               t_7 >= value_0),
                              'FungibleToken: balance overflow');
      const tmp_3 = ((t1) => {
                      if (t1 > 340282366920938463463374607431768211455n) {
                        throw new __compactRuntime.CompactError('fungible_token_v2.6.compact line 638 char 36: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 340282366920938463463374607431768211455');
                      }
                      return t1;
                    })(toBal_0 + value_0);
      __compactRuntime.queryLedgerState(context,
                                        partialProofData,
                                        [
                                         { idx: { cached: false,
                                                  pushPath: true,
                                                  path: [
                                                         { tag: 'value',
                                                           value: { value: _descriptor_13.toValue(0n),
                                                                    alignment: _descriptor_13.alignment() } }] } },
                                         { push: { storage: false,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(to_0),
                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                         { push: { storage: true,
                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_3),
                                                                                                alignment: _descriptor_3.alignment() }).encode() } },
                                         { ins: { cached: false, n: 1 } },
                                         { ins: { cached: true, n: 1 } }]);
    }
    return [];
  }
  __mint_0(context, partialProofData, account_0, value_0) {
    __compactRuntime.assert(!this._isZeroKey_0(account_0),
                            'FungibleToken: invalid receiver');
    this.__update_0(context,
                    partialProofData,
                    this._zeroKey_0(),
                    account_0,
                    value_0);
    return [];
  }
  __burn_0(context, partialProofData, account_0, value_0) {
    __compactRuntime.assert(!this._isZeroKey_0(account_0),
                            'FungibleToken: invalid sender');
    this.__update_0(context,
                    partialProofData,
                    account_0,
                    this._zeroKey_0(),
                    value_0);
    return [];
  }
  __approve_0(context, partialProofData, ownerAccount_0, spender_0, value_0) {
    __compactRuntime.assert(!this._isZeroKey_0(ownerAccount_0),
                            'FungibleToken: invalid owner');
    __compactRuntime.assert(!this._isZeroKey_0(spender_0),
                            'FungibleToken: invalid spender');
    const key_0 = [ownerAccount_0, spender_0];
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_13.toValue(1n),
                                                                  alignment: _descriptor_13.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(key_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(value_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  __spendAllowance_0(context,
                     partialProofData,
                     ownerAccount_0,
                     spender_0,
                     value_0)
  {
    const currentAllowance_0 = this._allowance_0(context,
                                                 partialProofData,
                                                 ownerAccount_0,
                                                 spender_0);
    __compactRuntime.assert(currentAllowance_0 >= value_0,
                            'FungibleToken: insufficient allowance');
    const MAX_UINT128_0 = 340282366920938463463374607431768211455n;
    if (currentAllowance_0 < MAX_UINT128_0) {
      let t_0;
      this.__approve_0(context,
                       partialProofData,
                       ownerAccount_0,
                       spender_0,
                       (t_0 = value_0,
                        (__compactRuntime.assert(currentAllowance_0 >= t_0,
                                                 'result of subtraction would be negative'),
                         currentAllowance_0 - t_0)));
    }
    return [];
  }
  _isZeroKey_0(key_0) { return this._equal_7(key_0, new Uint8Array(32)); }
  _zeroKey_0() { return new Uint8Array(32); }
  _equal_0(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_0(context, partialProofData, f, x, a0) {
    for (let i = 0; i < 3; i++) { x = f(context, partialProofData, x, a0[i]); }
    return x;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
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
    _balances: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(0n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                                                 alignment: _descriptor_6.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(0n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'fungible_token_v2.6.compact line 87 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(0n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'fungible_token_v2.6.compact line 87 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(0n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_3.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    _allowances: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(1n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                                                 alignment: _descriptor_6.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(1n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(Array.isArray(key_0) && key_0.length === 2  && key_0[0].buffer instanceof ArrayBuffer && key_0[0].BYTES_PER_ELEMENT === 1 && key_0[0].length === 32 && key_0[1].buffer instanceof ArrayBuffer && key_0[1].BYTES_PER_ELEMENT === 1 && key_0[1].length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'fungible_token_v2.6.compact line 88 char 1',
                                     '[Bytes<32>, Bytes<32>]',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(1n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(key_0),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(Array.isArray(key_0) && key_0.length === 2  && key_0[0].buffer instanceof ArrayBuffer && key_0[0].BYTES_PER_ELEMENT === 1 && key_0[0].length === 32 && key_0[1].buffer instanceof ArrayBuffer && key_0[1].BYTES_PER_ELEMENT === 1 && key_0[1].length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'fungible_token_v2.6.compact line 88 char 1',
                                     '[Bytes<32>, Bytes<32>]',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(1n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(key_0),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_2.fromValue(key.value),      _descriptor_3.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get _totalSupply() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_13.toValue(2n),
                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get _maxSupply() {
      return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_13.toValue(3n),
                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get _name() {
      return _descriptor_23.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_13.toValue(4n),
                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get _symbol() {
      return _descriptor_23.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_13.toValue(5n),
                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get _decimals() {
      return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_13.toValue(6n),
                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get owner() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_13.toValue(7n),
                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get _contractSalt() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_13.toValue(8n),
                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get _paused() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_13.toValue(9n),
                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get _emergencyPauser() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_13.toValue(10n),
                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    _multisigSigners: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(11n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(0n),
                                                                                                                                 alignment: _descriptor_6.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(11n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'fungible_token_v2.6.compact line 102 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_13.toValue(11n),
                                                                                                     alignment: _descriptor_13.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[11];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    get _multisigThreshold() {
      return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_13.toValue(12n),
                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get _multisigSignerCount() {
      return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_13.toValue(13n),
                                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                                         { popeq: { cached: false,
                                                                                    result: undefined } }]).value);
    },
    get _multisigNonce() {
      return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_13.toValue(14n),
                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  getSchnorrReduction: (...args) => undefined,
  localSecretKey: (...args) => undefined
});
export const pureCircuits = {
  calculateSignerCommitment: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`calculateSignerCommitment: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const pk_0 = args_0[0];
    const salt_0 = args_0[1];
    if (!(salt_0.buffer instanceof ArrayBuffer && salt_0.BYTES_PER_ELEMENT === 1 && salt_0.length === 32)) {
      __compactRuntime.typeError('calculateSignerCommitment',
                                 'argument 2',
                                 'fungible_token_v2.6.compact line 153 char 1',
                                 'Bytes<32>',
                                 salt_0)
    }
    return _dummyContract._calculateSignerCommitment_0(pk_0, salt_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
