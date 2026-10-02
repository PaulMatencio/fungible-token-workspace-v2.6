import { friendlyMessage } from '@/domain/errors';
import { ACTION_STEPS_TEST, ACTION_STEPS_WALLET, MULTISIG_VERIFY_STEP, actionTracker, type DeployTracker, type StepDef } from './deployProgress';

export interface RunOptions {
  mode: 'test' | 'wallet';
  /** Circuit name; shown as the panel heading. */
  title: string;
  /** Multisig operations add a leading "verify nonce / threshold / approvals" step. */
  multisig?: boolean;
  /** Overrides the default step list (e.g. native wallet transfers have no circuit/proof). */
  steps?: StepDef[];
  tracker?: DeployTracker;
}

/**
 * Runs a contract action while reporting its stages to a tracker. The first step (validate / verify) is marked
 * done by `fn` itself via `markFirstDone`, because validation happens inside the caller. Wallet stages
 * (prove / balance / submit / confirm) are reported by the wallet providers through the active sink.
 */
export async function runTracked<T extends { txHash?: string }>(
  o: RunOptions,
  fn: (markFirstDone: (next?: string) => void) => Promise<T>
): Promise<T> {
  const tracker = o.tracker ?? actionTracker;
  const base = o.mode === 'wallet' ? ACTION_STEPS_WALLET : ACTION_STEPS_TEST;
  const steps: StepDef[] = o.steps ?? (o.multisig ? [MULTISIG_VERIFY_STEP, ...base.filter((s) => s.id !== 'validate')] : base);
  tracker.start(o.mode, steps, o.title);
  const first = steps[0].id;
  tracker.begin(first);
  const markFirstDone = (next = 'build') => {
    tracker.done(first);
    tracker.begin(next);
  };
  try {
    const r = await fn(markFirstDone);
    tracker.succeed({ txHash: r?.txHash && !r.txHash.startsWith('(') ? r.txHash : undefined });
    return r;
  } catch (e) {
    tracker.fail(friendlyMessage(e));
    throw e;
  }
}
