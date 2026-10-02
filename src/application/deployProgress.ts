/**
 * Deploy progress model. Pure and framework-free: infrastructure adapters report
 * stage transitions through the `StepSink` port; the UI subscribes to snapshots.
 */
export type StepStatus = 'pending' | 'active' | 'done' | 'error';

export interface StepDef {
  id: string;
  /** i18n key suffix: `deploy.step.<id>` and `deploy.step.<id>.hint`. */
  labelKey: string;
  hintKey?: string;
  /** Literal label (used for dynamic steps such as per-circuit registration); wins over `labelKey`. */
  label?: string;
}

export interface StepState extends StepDef {
  status: StepStatus;
  startedAt?: number;
  endedAt?: number;
  error?: string;
}

export interface DeployProgress {
  mode: 'test' | 'wallet';
  /** Set for contract actions (e.g. the circuit name); absent for deploys. */
  title?: string;
  steps: StepState[];
  status: 'running' | 'success' | 'failed';
  startedAt: number;
  endedAt?: number;
  /** Set on success. */
  contractAddress?: string;
  txHash?: string;
}

export const WALLET_STEPS: StepDef[] = [
  { id: 'validate', labelKey: 'deploy.step.validate' },
  { id: 'build', labelKey: 'deploy.step.build', hintKey: 'deploy.step.build.hint' },
  { id: 'prove', labelKey: 'deploy.step.prove', hintKey: 'deploy.step.prove.hint' },
  { id: 'balance', labelKey: 'deploy.step.balance', hintKey: 'deploy.step.balance.hint' },
  { id: 'submit', labelKey: 'deploy.step.submit', hintKey: 'deploy.step.submit.hint' },
  { id: 'confirm', labelKey: 'deploy.step.confirm', hintKey: 'deploy.step.confirm.hint' },
  { id: 'save', labelKey: 'deploy.step.save' }
];

export const TEST_STEPS: StepDef[] = [
  { id: 'validate', labelKey: 'deploy.step.validate' },
  { id: 'build', labelKey: 'deploy.step.simulate', hintKey: 'deploy.step.simulate.hint' },
  { id: 'save', labelKey: 'deploy.step.save' }
];

/** Port implemented by the tracker and called by infrastructure adapters. */
export interface StepSink {
  begin(id: string): void;
  done(id: string): void;
  fail(message: string, id?: string): void;
}

type Listener = (p: DeployProgress | null) => void;

export class DeployTracker implements StepSink {
  private p: DeployProgress | null = null;
  private listeners = new Set<Listener>();

  constructor(private readonly now: () => number = Date.now) {}

  get snapshot(): DeployProgress | null {
    return this.p;
  }

  get running(): boolean {
    return this.p?.status === 'running';
  }

  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  private emit(next: DeployProgress | null) {
    this.p = next;
    this.listeners.forEach((l) => l(next));
  }

  private update(fn: (p: DeployProgress) => DeployProgress) {
    if (this.p) this.emit(fn(this.p));
  }

  start(mode: 'test' | 'wallet', defs: StepDef[] = mode === 'wallet' ? WALLET_STEPS : TEST_STEPS, title?: string) {
    this.emit({ mode, title, status: 'running', startedAt: this.now(), steps: defs.map((d) => ({ ...d, status: 'pending' as const })) });
  }

  /** Inserts steps just before `beforeId` (dynamic follow-up work discovered mid-run). */
  extend(defs: StepDef[], beforeId = 'save') {
    this.update((p) => {
      const idx = p.steps.findIndex((s) => s.id === beforeId);
      const add = defs.filter((d) => !p.steps.some((s) => s.id === d.id)).map((d) => ({ ...d, status: 'pending' as const }));
      const steps = [...p.steps];
      steps.splice(idx < 0 ? steps.length : idx, 0, ...add);
      return { ...p, steps };
    });
  }

  dismiss() {
    if (this.p?.status !== 'running') this.emit(null);
  }

  begin(id: string) {
    this.update((p) => ({
      ...p,
      steps: p.steps.map((s) => {
        if (s.id === id) return s.status === 'pending' ? { ...s, status: 'active', startedAt: this.now() } : s;
        return s;
      })
    }));
  }

  /** Completes a step; earlier steps still marked pending/active are completed too (they can't be skipped backwards). */
  done(id: string) {
    this.update((p) => {
      const idx = p.steps.findIndex((s) => s.id === id);
      if (idx < 0) return p;
      const t = this.now();
      return {
        ...p,
        steps: p.steps.map((s, i) =>
          i <= idx && s.status !== 'done' && s.status !== 'error'
            ? { ...s, status: 'done', startedAt: s.startedAt ?? t, endedAt: t }
            : s
        )
      };
    });
  }

  /** Marks `id` (default: the active step) as failed and ends the run. */
  fail(message: string, id?: string) {
    this.update((p) => {
      const target = id ?? p.steps.find((s) => s.status === 'active')?.id ?? p.steps.find((s) => s.status === 'pending')?.id;
      const t = this.now();
      return {
        ...p,
        status: 'failed',
        endedAt: t,
        steps: p.steps.map((s) => (s.id === target ? { ...s, status: 'error', endedAt: t, error: message } : s))
      };
    });
  }

  succeed(info: { contractAddress?: string; txHash?: string } = {}) {
    this.update((p) => {
      const t = this.now();
      return {
        ...p,
        status: 'success',
        endedAt: t,
        ...info,
        steps: p.steps.map((s) => (s.status === 'done' ? s : { ...s, status: 'done', startedAt: s.startedAt ?? t, endedAt: t }))
      };
    });
  }
}

export const deployTracker = new DeployTracker();
/** Separate tracker for contract actions (transfer, mint, …) so it never disturbs a deploy's progress. */
export const actionTracker = new DeployTracker();

/**
 * Sink handed to the wallet providers: stage reports (prove / balance / submit / confirm) go to whichever tracker
 * is currently running — an action if one is, otherwise a deploy.
 */
export const activeSink: StepSink = {
  begin: (id) => (actionTracker.running ? actionTracker : deployTracker).begin(id),
  done: (id) => (actionTracker.running ? actionTracker : deployTracker).done(id),
  fail: (m, id) => (actionTracker.running ? actionTracker : deployTracker).fail(m, id)
};

/** Step lists for contract actions. Wallet Mode adds the prove / wallet / submit / confirm stages. */
export const ACTION_STEPS_WALLET: StepDef[] = [
  { id: 'validate', labelKey: 'action.step.validate' },
  { id: 'build', labelKey: 'action.step.build', hintKey: 'action.step.build.hint' },
  { id: 'prove', labelKey: 'action.step.prove', hintKey: 'deploy.step.prove.hint' },
  { id: 'balance', labelKey: 'action.step.balance', hintKey: 'deploy.step.balance.hint' },
  { id: 'submit', labelKey: 'action.step.submit', hintKey: 'deploy.step.submit.hint' },
  { id: 'confirm', labelKey: 'action.step.confirm', hintKey: 'deploy.step.confirm.hint' }
];
export const ACTION_STEPS_TEST: StepDef[] = [
  { id: 'validate', labelKey: 'action.step.validate' },
  { id: 'build', labelKey: 'action.step.simulate', hintKey: 'deploy.step.simulate.hint' }
];
export const MULTISIG_VERIFY_STEP: StepDef = { id: 'verify', labelKey: 'action.step.verify', hintKey: 'action.step.verify.hint' };
