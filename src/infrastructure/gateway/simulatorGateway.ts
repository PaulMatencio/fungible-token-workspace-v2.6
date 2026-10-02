/**
 * Test Mode adapter: executes the compiled contract locally through the Compact runtime 0.16 (no network, no proofs;
 * the 0.16 API is synchronous, `await` below is harmless). Semantics — asserts, nonce handling, authenticate() — are
 * the compiled circuits' own.
 */
import {
  createCircuitContext,
  createConstructorContext,
  type CircuitContext
} from '@midnight-ntwrk/compact-runtime';
import type { ApprovalSlotInput, DeployParams, TokenGateway } from '@/application/ports';
import { AppError } from '@/domain/errors';
import { bytesToHex, hex32ToBytes } from '@/domain/hex';
import type { ApprovalFile, MultisigOp } from '@/domain/multisig';
import type { TokenState, TxReceipt } from '@/domain/token';
import { Contract, ledger } from '../contract/module';
import { createWitnesses } from '../contract/witnesses';
import { pointFromJson, randomBytes, ZERO_POINT } from '../crypto/signing';

const ZERO_COIN_PK = '00'.repeat(32);

export type SecretKeyResolver = (account: string) => Uint8Array;

/** JSON-safe record of a successful call, used to rebuild state after a reload. */
export type ReplayOp =
  | { kind: 'holder'; circuit: 'transfer' | 'approve' | 'transferFrom' | 'selfBurn' | 'pause' | 'unpause' | 'emergencyWithdraw'; caller: string; args: string[] }
  | { kind: 'multisig'; op: MultisigOp; approvals: ApprovalFile[]; pop?: ApprovalFile };

export interface SimulatorSnapshot {
  version: 1;
  contractAddress: string;
  owner: string;
  params: Omit<DeployParams, 'maxSupply'> & { maxSupply: string; salt: string };
  ops: ReplayOp[];
}

export class SimulatorGateway implements TokenGateway {
  readonly mode = 'test' as const;
  private ctx: CircuitContext<undefined>;
  private activeSk: Uint8Array = new Uint8Array(32);
  private readonly contract: Contract<undefined>;
  private counter = 0;
  private ops: ReplayOp[] = [];

  private constructor(
    readonly contractAddress: string,
    ctx: CircuitContext<undefined>,
    private readonly resolveSk: SecretKeyResolver,
    private readonly meta: Pick<SimulatorSnapshot, 'owner' | 'params'>
  ) {
    this.ctx = ctx;
    this.contract = new Contract<undefined>(createWitnesses(() => this.activeSk));
  }

  /** Deploys a fresh in-memory instance owned by `ownerAccount`. */
  static async deploy(
    params: DeployParams,
    ownerAccount: string,
    resolveSk: SecretKeyResolver,
    address: string = bytesToHex(randomBytes(32))
  ): Promise<SimulatorGateway> {
    const salt = params.salt ?? bytesToHex(randomBytes(32));
    const contract = new Contract<undefined>(createWitnesses(() => new Uint8Array(32)));
    const init = await contract.initialState(
      createConstructorContext(undefined, ZERO_COIN_PK),
      hex32ToBytes(salt, 'salt'),
      hex32ToBytes(ownerAccount, 'owner'),
      params.name,
      params.symbol,
      BigInt(params.decimals),
      params.maxSupply,
      params.signerCommitments.map((c) => hex32ToBytes(c, 'signer commitment')),
      BigInt(params.threshold)
    );
    const ctx = createCircuitContext<undefined>(address, ZERO_COIN_PK, init.currentContractState, init.currentPrivateState);
    return new SimulatorGateway(address, ctx, resolveSk, {
      owner: ownerAccount,
      params: { ...params, maxSupply: params.maxSupply.toString(), salt }
    });
  }

  private async run<R>(
    desc: ReplayOp,
    call: (c: Contract<undefined>, ctx: CircuitContext<undefined>) => { result: R; context: CircuitContext<undefined> } | Promise<{ result: R; context: CircuitContext<undefined> }>
  ): Promise<TxReceipt> {
    this.activeSk = desc.kind === 'holder' ? this.resolveSk(desc.caller) : new Uint8Array(32);
    try {
      const out = await call(this.contract, this.ctx);
      this.ctx = out.context;
    } catch (e) {
      throw new AppError('CONTRACT_REJECTED', (e as Error).message, { cause: e });
    } finally {
      this.activeSk = new Uint8Array(32);
    }
    this.ops.push(desc);
    this.counter++;
    const hash = bytesToHex(randomBytes(32));
    return { txId: hash, txHash: hash, blockHeight: this.counter };
  }

  snapshot(): SimulatorSnapshot {
    return { version: 1, contractAddress: this.contractAddress, owner: this.meta.owner, params: this.meta.params, ops: [...this.ops] };
  }

  /** Rebuilds an instance by replaying recorded calls (deterministic: same address, same signatures). */
  static async restore(snap: SimulatorSnapshot, resolveSk: SecretKeyResolver): Promise<SimulatorGateway> {
    const gw = await SimulatorGateway.deploy({ ...snap.params, maxSupply: BigInt(snap.params.maxSupply) }, snap.owner, resolveSk, snap.contractAddress);
    for (const o of snap.ops) {
      if (o.kind === 'multisig') await gw.executeMultisig(o.op, o.approvals, o.pop);
      else {
        const a = o.args;
        if (o.circuit === 'transfer') await gw.transfer(o.caller, a[0], BigInt(a[1]));
        else if (o.circuit === 'approve') await gw.approve(o.caller, a[0], BigInt(a[1]));
        else if (o.circuit === 'transferFrom') await gw.transferFrom(o.caller, a[0], a[1], BigInt(a[2]));
        else if (o.circuit === 'selfBurn') await gw.selfBurn(o.caller, BigInt(a[0]));
        else if (o.circuit === 'pause') await gw.pause(o.caller);
        else if (o.circuit === 'unpause') await gw.unpause(o.caller);
        else await gw.emergencyWithdraw(o.caller, BigInt(a[0]));
      }
    }
    return gw;
  }

  private raw() {
    return ledger(this.ctx.currentQueryContext.state);
  }

  async getState(): Promise<TokenState> {
    const l = this.raw();
    return {
      contractAddress: this.contractAddress,
      name: l._name,
      symbol: l._symbol,
      decimals: Number(l._decimals),
      totalSupply: l._totalSupply,
      maxSupply: l._maxSupply,
      owner: bytesToHex(l.owner),
      contractSalt: bytesToHex(l._contractSalt),
      paused: l._paused,
      emergencyPauser: bytesToHex(l._emergencyPauser),
      multisigThreshold: Number(l._multisigThreshold),
      multisigSignerCount: Number(l._multisigSignerCount),
      multisigNonce: l._multisigNonce,
      signerCommitments: [...l._multisigSigners].map(bytesToHex)
    };
  }

  async balanceOf(account: string): Promise<bigint> {
    const l = this.raw();
    const k = hex32ToBytes(account, 'account');
    return l._balances.member(k) ? l._balances.lookup(k) : 0n;
  }

  async allowance(owner: string, spender: string): Promise<bigint> {
    const l = this.raw();
    const k: [Uint8Array, Uint8Array] = [hex32ToBytes(owner, 'owner'), hex32ToBytes(spender, 'spender')];
    return l._allowances.member(k) ? l._allowances.lookup(k) : 0n;
  }

  async transfer(caller: string, to: string, value: bigint) {
    return this.run({ kind: 'holder', circuit: 'transfer', caller, args: [to, value.toString()] }, (c, x) => c.impureCircuits.transfer(x, hex32ToBytes(caller), hex32ToBytes(to, 'to'), value));
  }
  async approve(caller: string, spender: string, value: bigint) {
    return this.run({ kind: 'holder', circuit: 'approve', caller, args: [spender, value.toString()] }, (c, x) => c.impureCircuits.approve(x, hex32ToBytes(caller), hex32ToBytes(spender, 'spender'), value));
  }
  async transferFrom(caller: string, from: string, to: string, value: bigint) {
    return this.run({ kind: 'holder', circuit: 'transferFrom', caller, args: [from, to, value.toString()] }, (c, x) =>
      c.impureCircuits.transferFrom(x, hex32ToBytes(caller), hex32ToBytes(from, 'from'), hex32ToBytes(to, 'to'), value)
    );
  }
  async selfBurn(caller: string, value: bigint) {
    return this.run({ kind: 'holder', circuit: 'selfBurn', caller, args: [value.toString()] }, (c, x) => c.impureCircuits.selfBurn(x, hex32ToBytes(caller), value));
  }
  async pause(caller: string) {
    return this.run({ kind: 'holder', circuit: 'pause', caller, args: [] }, (c, x) => c.impureCircuits.pause(x, hex32ToBytes(caller)));
  }
  async unpause(caller: string) {
    return this.run({ kind: 'holder', circuit: 'unpause', caller, args: [] }, (c, x) => c.impureCircuits.unpause(x, hex32ToBytes(caller)));
  }
  async emergencyWithdraw(caller: string, amount: bigint) {
    return this.run({ kind: 'holder', circuit: 'emergencyWithdraw', caller, args: [amount.toString()] }, (c, x) => c.impureCircuits.emergencyWithdraw(x, hex32ToBytes(caller), amount));
  }

  async executeMultisig(op: MultisigOp, approvals: ApprovalFile[], pop?: ApprovalFile) {
    const { pubkeys, signatures } = padApprovals(approvals);
    return this.run({ kind: 'multisig', op, approvals, pop }, async (c, x) => {
      const k = c.impureCircuits;
      switch (op.type) {
        case 'mint':
          return k.mint(x, hex32ToBytes(op.to, 'to'), BigInt(op.value), pubkeys, signatures);
        case 'burn':
          return k.burn(x, hex32ToBytes(op.account, 'account'), BigInt(op.value), pubkeys, signatures);
        case 'setEmergencyPauser':
          return k.setEmergencyPauser(x, hex32ToBytes(op.newPauser, 'newPauser'), pubkeys, signatures);
        case 'adminReallocate':
          return k.adminReallocate(x, hex32ToBytes(op.trappedAccount, 'trappedAccount'), hex32ToBytes(op.targetSpendableAccount, 'targetSpendableAccount'), BigInt(op.amount), pubkeys, signatures);
        case 'rotateSigner': {
          if (!pop) throw new AppError('VALIDATION', 'rotateSigner needs the incoming signer’s proof-of-possession');
          return k.rotateSigner(x, hex32ToBytes(op.oldSignerCommitment, 'oldSignerCommitment'), pointFromJson(op.newSignerPubkey), toSchnorr(pop.signature), pubkeys, signatures);
        }
      }
    });
  }
}

const toSchnorr = (s: ApprovalSlotInput['signature']) => ({
  announcement: pointFromJson(s.announcement),
  response: BigInt(s.response)
});

/** Pads to the contract's 3 slots; unused slots are the zero point (skipped on-chain). */
export function padApprovals(approvals: ApprovalFile[]) {
  if (approvals.length < 1 || approvals.length > 3) throw new AppError('VALIDATION', 'Provide 1–3 approvals');
  const pubkeys = approvals.map((a) => pointFromJson(a.publicKey));
  const signatures = approvals.map((a) => toSchnorr(a.signature));
  while (pubkeys.length < 3) {
    pubkeys.push(ZERO_POINT);
    signatures.push({ announcement: ZERO_POINT, response: 0n });
  }
  return { pubkeys, signatures };
}
