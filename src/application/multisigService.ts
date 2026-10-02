import { AppError } from '@/domain/errors';
import { bytesToHex } from '@/domain/hex';
import type { ApprovalFile, MultisigOp, SigningRequest } from '@/domain/multisig';
import { parseApprovalFile } from '@/domain/multisig';
import type { TokenState, TxReceipt } from '@/domain/token';
import type { SignerCrypto, TokenGateway } from './ports';
import { parsePubkey, requireAccount, requireAmount } from './validation';
import { runTracked } from './actionRun';

/**
 * v2.6 has 3 approval slots; unused ones are padded with an all-zero point, which the real proof server rejects
 * ("Point should be part of the subgroup"). On-chain (Wallet Mode) all 3 signatures are therefore required in practice,
 * even when the contract's threshold is lower. The simulator has no such limit. (The v3 contract fixes this.)
 */
export const REAL_PROVER_APPROVALS = 3;

export type OpInput =
  | { type: 'mint'; to: string; amount: string }
  | { type: 'burn'; account: string; amount: string }
  | { type: 'setEmergencyPauser'; newPauser: string }
  | { type: 'adminReallocate'; trappedAccount: string; targetSpendableAccount: string; amount: string }
  | { type: 'rotateSigner'; oldSignerCommitment: string; newSignerPubkey: string };

/**
 * Coordinator side of the OpenZeppelin-style multisig flow:
 *   1. build a signing request (bound to contract address + current nonce),
 *   2. cosigners sign it OFFLINE with signer-tools and return approval files,
 *   3. verify each approval independently, then submit.
 * No secret ever passes through the app.
 */
export class MultisigService {
  constructor(
    private readonly gateway: TokenGateway,
    private readonly crypto: SignerCrypto,
    private readonly network: string,
    private readonly decimals: number
  ) {}

  buildRequest(state: TokenState, input: OpInput): SigningRequest {
    let op: MultisigOp;
    switch (input.type) {
      case 'mint':
        op = { type: 'mint', to: requireAccount(input.to, 'Recipient'), value: requireAmount(input.amount, this.decimals).toString() };
        break;
      case 'burn':
        op = { type: 'burn', account: requireAccount(input.account, 'Account'), value: requireAmount(input.amount, this.decimals).toString() };
        if (op.account !== state.owner) throw new AppError('VALIDATION', 'Multisig burn is restricted to the owner/treasury account');
        break;
      case 'setEmergencyPauser':
        op = { type: 'setEmergencyPauser', newPauser: requireAccount(input.newPauser, 'New pauser (manager token account)') };
        break;
      case 'adminReallocate':
        op = {
          type: 'adminReallocate',
          trappedAccount: requireAccount(input.trappedAccount, 'Trapped account'),
          targetSpendableAccount: requireAccount(input.targetSpendableAccount, 'Target account'),
          amount: requireAmount(input.amount, this.decimals).toString()
        };
        break;
      case 'rotateSigner': {
        const old = requireAccount(input.oldSignerCommitment, 'Old signer commitment');
        if (!state.signerCommitments.includes(old)) throw new AppError('VALIDATION', 'Old signer commitment is not registered');
        op = { type: 'rotateSigner', oldSignerCommitment: old, newSignerPubkey: parsePubkey(input.newSignerPubkey) };
        break;
      }
    }
    const req: SigningRequest = {
      version: 1,
      network: this.network,
      contractAddress: state.contractAddress,
      contractSalt: state.contractSalt,
      nonce: state.multisigNonce.toString(),
      op
    };
    this.crypto.computeDigest(req); // fail early on malformed input
    return req;
  }

  digestHex(req: SigningRequest): string {
    return bytesToHex(this.crypto.computeDigest(req));
  }

  /** Parses + verifies one uploaded approval; returns the file or throws with a reason. */
  acceptApproval(req: SigningRequest, state: TokenState, text: string, pop = false): ApprovalFile {
    const f = parseApprovalFile(text);
    if (pop !== (f.kind === 'pop')) throw new AppError('VALIDATION', pop ? 'Expected a proof-of-possession file' : 'Expected a regular approval file');
    const v = this.crypto.verifyApproval(req, f);
    if (!v.ok) throw new AppError('VALIDATION', v.reason);
    const commitment = this.crypto.commitmentFor(f.publicKey, state.contractSalt);
    if (!pop && !state.signerCommitments.includes(commitment)) {
      throw new AppError('VALIDATION', 'Signer is not registered on this contract');
    }
    return f;
  }

  /** Approvals needed to actually execute: the contract threshold, or all 3 slots on-chain (see REAL_PROVER_APPROVALS). */
  requiredApprovals(state: TokenState): number {
    return this.gateway.mode === 'wallet' ? Math.max(state.multisigThreshold, REAL_PROVER_APPROVALS) : state.multisigThreshold;
  }

  async submit(req: SigningRequest, approvals: ApprovalFile[], pop?: ApprovalFile): Promise<TxReceipt> {
    return runTracked({ mode: this.gateway.mode, title: req.op.type, multisig: true }, async (verified) => {
      const distinct = new Set(approvals.map((a) => `${a.publicKey.x}:${a.publicKey.y}`));
      if (distinct.size !== approvals.length) throw new AppError('VALIDATION', 'Duplicate signer among approvals');
      const state = await this.gateway.getState();
      if (state.multisigNonce.toString() !== req.nonce) {
        throw new AppError('VALIDATION', 'Nonce changed since this request was created — rebuild it and collect new signatures');
      }
      const need = this.requiredApprovals(state);
      if (approvals.length < need) {
        throw new AppError(
          'VALIDATION',
          this.gateway.mode === 'wallet' && need > state.multisigThreshold
            ? `Need all ${need} approvals on-chain (threshold is ${state.multisigThreshold}, but the proof server cannot take empty approval slots); have ${approvals.length}`
            : `Need ${need} approvals, have ${approvals.length}`
        );
      }
      verified();
      return this.gateway.executeMultisig(req.op, approvals, pop);
    });
  }
}
