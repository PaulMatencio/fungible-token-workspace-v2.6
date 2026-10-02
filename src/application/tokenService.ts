import { AppError, friendlyMessage } from '@/domain/errors';
import type { CircuitName, TxReceipt } from '@/domain/token';
import type { TokenGateway, TxLogEntry, TxLogPort } from './ports';
import { requireAccount, requireAmount } from './validation';
import { runTracked } from './actionRun';

type Logger = Pick<TxLogPort, 'add'>;

/**
 * Use-cases for a connected FungibleToken v2.6 (internal balance/allowance ledger). Validates user input, delegates to
 * the gateway, and persists every attempt (success or failure) to the log.
 */
export class TokenService {
  constructor(
    private readonly gateway: TokenGateway,
    private readonly log: Logger,
    /** The caller's own 64-hex token account. */
    private readonly account: string,
    private readonly decimals: number
  ) {}

  private async track(circuit: CircuitName, fn: () => Promise<TxReceipt>): Promise<TxReceipt> {
    const base: Pick<TxLogEntry, 'contractAddress' | 'circuit' | 'mode' | 'at'> = {
      contractAddress: this.gateway.contractAddress,
      circuit,
      mode: this.gateway.mode,
      at: Date.now()
    };
    try {
      // Validation already happened in the caller, so the first step is complete as soon as we start.
      const r = await runTracked({ mode: this.gateway.mode, title: circuit }, async (firstDone) => {
        firstDone();
        return fn();
      });
      await this.log.add({ ...base, id: `${r.txHash}:${circuit}`, txHash: r.txHash, txId: r.txId, blockHeight: r.blockHeight, status: 'finalized' });
      return r;
    } catch (e) {
      await this.log.add({ ...base, id: `fail:${base.at}:${circuit}`, txHash: '', txId: '', status: 'failed', error: friendlyMessage(e) });
      throw e instanceof AppError ? e : new AppError('CONTRACT_REJECTED', friendlyMessage(e), { cause: e });
    }
  }

  transfer(to: string, amount: string) {
    const [t, v] = [requireAccount(to, 'Recipient'), requireAmount(amount, this.decimals)];
    return this.track('transfer', () => this.gateway.transfer(this.account, t, v));
  }
  approve(spender: string, amount: string) {
    const s = requireAccount(spender, 'Spender');
    // approve(…, 0) is a legitimate way to revoke, so zero is allowed here.
    const v = amount.trim() === '0' ? 0n : requireAmount(amount, this.decimals);
    return this.track('approve', () => this.gateway.approve(this.account, s, v));
  }
  transferFrom(from: string, to: string, amount: string) {
    const [f, t, v] = [requireAccount(from, 'From'), requireAccount(to, 'Recipient'), requireAmount(amount, this.decimals)];
    return this.track('transferFrom', () => this.gateway.transferFrom(this.account, f, t, v));
  }
  selfBurn(amount: string) {
    const v = requireAmount(amount, this.decimals);
    return this.track('selfBurn', () => this.gateway.selfBurn(this.account, v));
  }
  pause() {
    return this.track('pause', () => this.gateway.pause(this.account));
  }
  unpause() {
    return this.track('unpause', () => this.gateway.unpause(this.account));
  }
  emergencyWithdraw(amount: string) {
    const v = requireAmount(amount, this.decimals);
    return this.track('emergencyWithdraw', () => this.gateway.emergencyWithdraw(this.account, v));
  }

  // Read-only queries
  balanceOf(account: string) {
    return this.gateway.balanceOf(requireAccount(account, 'Account'));
  }
  allowance(owner: string, spender: string) {
    return this.gateway.allowance(requireAccount(owner, 'Owner'), requireAccount(spender, 'Spender'));
  }
  /** "Approval status": true when the spender currently has a non-zero allowance. */
  async isApproved(owner: string, spender: string) {
    return (await this.allowance(owner, spender)) > 0n;
  }
}
