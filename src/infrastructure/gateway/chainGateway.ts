/**
 * Wallet Mode adapter: builds, proves, balances and submits real transactions
 * through midnight-js and the connected wallet (Lace / 1AM).
 */
import { deployContract, findDeployedContract, submitInsertVerifierKeyTx } from '@midnight-ntwrk/midnight-js-contracts';
import type { ApprovalSlotInput, DeployParams, TokenGateway } from '@/application/ports';
import { AppError, compactText, deepMessage } from '@/domain/errors';
import { bytesToHex, hex32ToBytes } from '@/domain/hex';
import type { ApprovalFile, MultisigOp } from '@/domain/multisig';
import type { TokenState, TxReceipt } from '@/domain/token';
import { contractConfig } from '../config/network';
import { allCircuitIds, makeCompiledContract } from '../contract/compiled';
import { ledger } from '../contract/module';
import { pointFromJson, randomBytes } from '../crypto/signing';
import type { AppProviders } from '../wallet/providers';
import { padApprovals } from './simulatorGateway';

type CallTx = Record<string, (...args: unknown[]) => Promise<{ public: { txId: string; txHash: string; blockHeight: number } }>>;
interface Found {
  callTx: CallTx;
  deployTxData: { public: { contractAddress: string; txId: string; txHash: string; blockHeight: number } };
}

/** Walks the cause chain: midnight-js wraps the real failure (proof server, wallet, node) several layers deep. */
function describeError(e: unknown): string {
  const parts: string[] = [];
  for (let c: unknown = e, i = 0; c && i < 5; i++) {
    parts.push(c instanceof Error ? `${c.name}: ${c.message}` : typeof c === 'object' ? deepMessage(c).join(' ← ') : String(c));
    c = (c as { cause?: unknown }).cause;
  }
  // Drop a cause whose text the outer message already contains (stage() wraps the original error).
  const kept = parts.filter((part, i) => !parts.slice(0, i).some((outer) => outer.includes(part.replace(/^[A-Za-z]*Error: /, ''))));
  return compactText(kept.join(' ← '));
}

const toReceipt = (r: { public: { txId: string; txHash: string; blockHeight: number } }): TxReceipt => ({
  txId: String(r.public.txId),
  txHash: r.public.txHash,
  blockHeight: r.public.blockHeight
});

export class ChainGateway implements TokenGateway {
  readonly mode = 'wallet' as const;

  private constructor(
    readonly contractAddress: string,
    private found: Found,
    private readonly providers: AppProviders,
    private readonly getSecretKey: () => Uint8Array
  ) {}

  /** Circuit names whose verifier key is currently registered on-chain. */
  private static async registered(providers: AppProviders, address: string): Promise<Set<string>> {
    const s = await providers.publicDataProvider.queryContractState(address);
    if (!s) throw new AppError('CONTRACT_REJECTED', 'Contract state not found on this network');
    return new Set(s.operations().map((o: unknown) => (typeof o === 'string' ? o : new TextDecoder().decode(o as Uint8Array))));
  }

  /**
   * Opens the contract with exactly the circuits that are registered on-chain. midnight-js verifies that every
   * circuit of the contract definition it is given has a matching on-chain verifier key, so handing it the full
   * definition while some keys are still pending (staged deploy) would fail with "…undefined or have mismatched
   * verifier keys".
   */
  private static async open(providers: AppProviders, address: string, getSecretKey: () => Uint8Array): Promise<Found> {
    const have = await ChainGateway.registered(providers, address);
    const all = allCircuitIds();
    const subset = all.every((c) => have.has(c)) ? undefined : all.filter((c) => have.has(c));
    return (await (findDeployedContract as unknown as (p: unknown, o: unknown) => Promise<Found>)(providers, {
      contractAddress: address,
      compiledContract: makeCompiledContract(getSecretKey, subset)
    })) as Found;
  }

  static async deploy(
    providers: AppProviders,
    params: DeployParams,
    ownerAccount: string,
    getSecretKey: () => Uint8Array
  ): Promise<{ gateway: ChainGateway; receipt: TxReceipt; salt: string }> {
    const salt = params.salt ?? bytesToHex(randomBytes(32));
    // Only the core circuits' verifier keys go into the deploy transaction (see contractConfig.deployCircuits).
    const compiledContract = makeCompiledContract(getSecretKey, params.deployCircuits ?? contractConfig.deployCircuits);
    try {
      const deployed = (await (deployContract as unknown as (p: unknown, o: unknown) => Promise<Found>)(providers, {
        compiledContract,
        args: [
          hex32ToBytes(salt, 'salt'),
          hex32ToBytes(ownerAccount, 'owner'),
          params.name,
          params.symbol,
          BigInt(params.decimals),
          params.maxSupply,
          params.signerCommitments.map((c) => hex32ToBytes(c, 'signer commitment')),
          BigInt(params.threshold)
        ]
      })) as Found;
      const d = deployed.deployTxData.public;
      // Re-open with the FULL contract so every circuit is callable once its key is registered.
      let gateway: ChainGateway;
      try {
        gateway = await ChainGateway.connect(providers, d.contractAddress, getSecretKey);
      } catch (e) {
        // The deploy itself succeeded; never lose the address.
        throw new AppError('CONTRACT_REJECTED', `Contract deployed at ${d.contractAddress} (tx ${d.txHash}), but opening it failed: ${describeError(e)}. Attach to that address to continue.`, { cause: e });
      }
      return {
        gateway,
        receipt: { txId: String(d.txId), txHash: d.txHash, blockHeight: d.blockHeight },
        salt
      };
    } catch (e) {
      console.error('[deploy] failed', e);
      throw new AppError('CONTRACT_REJECTED', describeError(e), { cause: e });
    }
  }

  static async connect(providers: AppProviders, contractAddress: string, getSecretKey: () => Uint8Array): Promise<ChainGateway> {
    const found = await ChainGateway.open(providers, contractAddress, getSecretKey);
    return new ChainGateway(contractAddress, found, providers, getSecretKey);
  }

  private async raw() {
    const s = await this.providers.publicDataProvider.queryContractState(this.contractAddress);
    if (!s) throw new AppError('CONTRACT_REJECTED', 'Contract state not found on this network');
    return ledger(s.data);
  }

  private async call(circuit: string, ...args: unknown[]): Promise<TxReceipt> {
    const fn = this.found.callTx[circuit];
    if (!fn) {
      throw new AppError('VALIDATION', `Circuit “${circuit}” is not registered on-chain yet. Use “Register remaining circuits” on the Overview tab first.`);
    }
    try {
      return toReceipt(await fn(...args));
    } catch (e) {
      console.error(`[${circuit}] failed`, e);
      throw new AppError('CONTRACT_REJECTED', describeError(e), { cause: e });
    }
  }

  /** Circuits of the compiled contract whose verifier key is not on-chain yet. */
  async missingCircuits(): Promise<string[]> {
    const have = await ChainGateway.registered(this.providers, this.contractAddress);
    return allCircuitIds().filter((c) => !have.has(c));
  }

  /** One maintenance transaction: inserts a circuit's verifier key (signed with the deploy-time authority key). */
  async registerCircuit(circuit: string): Promise<TxReceipt> {
    if (!allCircuitIds().includes(circuit)) throw new AppError('VALIDATION', `Unknown circuit ${circuit}`);
    try {
      const vk = await this.providers.zkConfigProvider.getVerifierKey(circuit);
      // Needs the FULL definition (the circuit isn't in the currently opened subset) and the deploy-time authority key,
      // which midnight-js reads from the private-state provider.
      const submit = (submitInsertVerifierKeyTx as unknown as (...a: unknown[]) => Promise<{ txId?: string; txHash: string; blockHeight: number }>)(
        this.providers,
        makeCompiledContract(this.getSecretKey),
        this.contractAddress,
        circuit,
        vk
      );
      submit.catch(() => {}); // a late rejection after the chain already confirmed must not surface as unhandled
      // midnight-js waits for the indexer to report the tx; that wait can stall even though the tx is final
      // (observed on preprod). Treat the chain's own state as the source of truth.
      const stop = { done: false };
      const confirmed = this.pollRegistered(circuit, stop);
      confirmed.catch(() => {});
      let r: Awaited<typeof submit> | null;
      try {
        r = (await Promise.race([submit.then((x) => ({ r: x })), confirmed.then(() => ({ r: null }))])).r;
      } finally {
        stop.done = true; // stop polling once we have an outcome
      }
      // The circuit is now registered: reopen so it becomes callable.
      this.found = await ChainGateway.open(this.providers, this.contractAddress, this.getSecretKey);
      return r
        ? { txId: String(r.txId ?? r.txHash), txHash: r.txHash, blockHeight: r.blockHeight }
        : { txId: '', txHash: '(confirmed from chain state)' };
    } catch (e) {
      console.error(`[register ${circuit}] failed`, e);
      throw new AppError('CONTRACT_REJECTED', describeError(e), { cause: e });
    }
  }

  /** Resolves when `circuit`'s verifier key shows up on-chain; rejects after `timeoutMs` (default 10 min). */
  private async pollRegistered(circuit: string, stop: { done: boolean }, timeoutMs = 10 * 60_000, everyMs = 4_000): Promise<void> {
    const end = Date.now() + timeoutMs;
    while (Date.now() < end && !stop.done) {
      await new Promise((r) => setTimeout(r, everyMs));
      try {
        if ((await ChainGateway.registered(this.providers, this.contractAddress)).has(circuit)) return;
      } catch {
        /* node/indexer hiccup: keep polling */
      }
    }
    if (stop.done) return;
    throw new AppError('CONTRACT_REJECTED', `Registering “${circuit}” was not confirmed on-chain within ${Math.round(timeoutMs / 60_000)} minutes. Check your wallet's history for a pending transaction, then use “Register remaining circuits” again.`);
  }

  async getState(): Promise<TokenState> {
    const l = await this.raw();
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

  async balanceOf(account: string) {
    const l = await this.raw();
    const k = hex32ToBytes(account, 'account');
    return l._balances.member(k) ? l._balances.lookup(k) : 0n;
  }

  async allowance(owner: string, spender: string) {
    const l = await this.raw();
    const k: [Uint8Array, Uint8Array] = [hex32ToBytes(owner, 'owner'), hex32ToBytes(spender, 'spender')];
    return l._allowances.member(k) ? l._allowances.lookup(k) : 0n;
  }

  transfer = (caller: string, to: string, value: bigint) =>
    this.call('transfer', hex32ToBytes(caller), hex32ToBytes(to, 'to'), value);
  approve = (caller: string, spender: string, value: bigint) =>
    this.call('approve', hex32ToBytes(caller), hex32ToBytes(spender, 'spender'), value);
  transferFrom = (caller: string, from: string, to: string, value: bigint) =>
    this.call('transferFrom', hex32ToBytes(caller), hex32ToBytes(from, 'from'), hex32ToBytes(to, 'to'), value);
  selfBurn = (caller: string, value: bigint) => this.call('selfBurn', hex32ToBytes(caller), value);
  pause = (caller: string) => this.call('pause', hex32ToBytes(caller));
  unpause = (caller: string) => this.call('unpause', hex32ToBytes(caller));
  emergencyWithdraw = (caller: string, amount: bigint) => this.call('emergencyWithdraw', hex32ToBytes(caller), amount);

  async executeMultisig(op: MultisigOp, approvals: ApprovalFile[], pop?: ApprovalFile) {
    const { pubkeys, signatures } = padApprovals(approvals);
    switch (op.type) {
      case 'mint':
        return this.call('mint', hex32ToBytes(op.to, 'to'), BigInt(op.value), pubkeys, signatures);
      case 'burn':
        return this.call('burn', hex32ToBytes(op.account, 'account'), BigInt(op.value), pubkeys, signatures);
      case 'setEmergencyPauser':
        return this.call('setEmergencyPauser', hex32ToBytes(op.newPauser, 'newPauser'), pubkeys, signatures);
      case 'adminReallocate':
        return this.call('adminReallocate', hex32ToBytes(op.trappedAccount, 'trappedAccount'), hex32ToBytes(op.targetSpendableAccount, 'targetSpendableAccount'), BigInt(op.amount), pubkeys, signatures);
      case 'rotateSigner': {
        if (!pop) throw new AppError('VALIDATION', 'rotateSigner needs the incoming signer’s proof-of-possession');
        const s: ApprovalSlotInput['signature'] = pop.signature;
        return this.call('rotateSigner', hex32ToBytes(op.oldSignerCommitment, 'oldSignerCommitment'), pointFromJson(op.newSignerPubkey), { announcement: pointFromJson(s.announcement), response: BigInt(s.response) }, pubkeys, signatures);
      }
    }
  }
}
