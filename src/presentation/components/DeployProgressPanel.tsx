'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import type { DeployProgress, StepState } from '@/application/deployProgress';
import { shortHex } from '@/domain/hex';
import { explorerContractUrl, explorerTxUrl } from '@/infrastructure/config/network';
import { useApp } from '../providers/AppProvider';
import { useT, type MessageKey } from '../i18n';
import { Alert, Badge, Mono } from './ui';

const secs = (ms: number) => `${Math.max(0, Math.round(ms / 1000))}s`;

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

function StepIcon({ s }: { s: StepState['status'] }) {
  if (s === 'done') return <CheckCircle2 size={18} className="text-ok" aria-hidden />;
  if (s === 'active') return <Loader2 size={18} className="animate-spin text-accent-soft" aria-hidden />;
  if (s === 'error') return <XCircle size={18} className="text-bad" aria-hidden />;
  return <Circle size={18} className="text-midnight-500" aria-hidden />;
}

/** Deployment progress (Build & Deploy tab and Overview). */
export function DeployProgressPanel() {
  const { deployProgress, dismissDeployProgress } = useApp();
  return <ProgressPanel progress={deployProgress} onDismiss={dismissDeployProgress} />;
}

/** Progress of the latest contract action (Operations tab) — every circuit, including each multisig operation. */
export function ActionProgressPanel() {
  const { actionProgress, dismissActionProgress } = useApp();
  return <ProgressPanel progress={actionProgress} onDismiss={dismissActionProgress} />;
}

/** Live, ordered view of a transaction pipeline with per-step timing, hints and the failing step's error. */
export function ProgressPanel({ progress: p, onDismiss: dismissDeployProgress }: { progress: DeployProgress | null; onDismiss: () => void }) {
  const { t } = useT();
  const now = useNow(p?.status === 'running');
  if (!p) return null;
  const isAction = p.title !== undefined;
  // Heading: the circuit's label when we have one (e.g. "Mint"), else the raw name.
  const opLabel = isAction ? (t(`op.${p.title}` as MessageKey) ?? p.title) : '';

  const total = p.steps.length;
  const doneCount = p.steps.filter((s) => s.status === 'done').length;
  const activeIdx = p.steps.findIndex((s) => s.status === 'active');
  const errorIdx = p.steps.findIndex((s) => s.status === 'error');
  const tone = p.status === 'success' ? 'ok' : p.status === 'failed' ? 'bad' : 'accent';
  const title = isAction
    ? `${opLabel} — ${p.status === 'running' ? t('action.progress.running') : p.status === 'success' ? t('action.progress.success') : t('action.progress.failed')}`
    : p.status === 'running' ? t('deploy.progress.running') : p.status === 'success' ? t('deploy.progress.success') : t('deploy.progress.failed');
  const elapsed = (p.endedAt ?? now) - p.startedAt;

  return (
    <div className={`mb-4 rounded-xl border p-3 sm:p-4 ${p.status === 'failed' ? 'border-bad/40 bg-bad/5' : p.status === 'success' ? 'border-ok/40 bg-ok/5' : 'border-accent/40 bg-accent/5'}`} aria-live="polite" role="region" aria-label={isAction ? opLabel : t('deploy.progress.title')}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone={tone}>{title}</Badge>
        <Badge tone="muted">{p.mode === 'wallet' ? t('mode.wallet') : t('mode.test')}</Badge>
        <span className="ml-auto text-xs text-slate-400">
          {t('deploy.progress.step')} {p.status === 'failed' ? errorIdx + 1 : p.status === 'success' ? total : activeIdx >= 0 ? activeIdx + 1 : doneCount + 1}/{total} · {secs(elapsed)}
        </span>
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-midnight-700" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneCount}>
        <div className={`h-full transition-all ${p.status === 'failed' ? 'bg-bad' : p.status === 'success' ? 'bg-ok' : 'bg-accent'}`} style={{ width: `${(doneCount / total) * 100}%` }} />
      </div>

      <ol className="space-y-2">
        {p.steps.map((s, i) => {
          const dur = s.startedAt ? (s.endedAt ?? now) - s.startedAt : 0;
          return (
            <li key={s.id} className="flex items-start gap-3" aria-current={s.status === 'active' ? 'step' : undefined}>
              <span className="mt-0.5 shrink-0"><StepIcon s={s.status} /></span>
              <div className="min-w-0 flex-1">
                <div className={`text-sm ${s.status === 'pending' ? 'text-slate-500' : s.status === 'error' ? 'text-bad' : 'text-slate-100'}`}>
                  <span className="mr-1 text-xs text-slate-500">{i + 1}.</span>
                  {s.label ?? t(s.labelKey as MessageKey)}
                  {s.startedAt && (s.status === 'active' || s.status === 'done') && <span className="ml-2 text-xs text-slate-500">{secs(dur)}</span>}
                </div>
                {s.status === 'active' && s.hintKey && <p className="mt-0.5 text-xs text-accent-soft">{t(s.hintKey as MessageKey)}</p>}
                {s.status === 'error' && s.error && <p className="mt-1 break-words text-xs text-bad">{s.error}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {p.status === 'success' && isAction && p.txHash && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-midnight-700 pt-3 text-xs">
          <span className="text-slate-400">{t('deploy.progress.tx')}</span>
          <span className="mono text-slate-300">{shortHex(p.txHash, 10, 8)}</span>
          {p.mode === 'wallet' && <a className="text-accent-soft underline" href={explorerTxUrl(p.txHash)} target="_blank" rel="noopener noreferrer">Explorer ↗</a>}
        </div>
      )}

      {p.status === 'success' && p.contractAddress && (
        <div className="mt-4 space-y-2 border-t border-midnight-700 pt-3 text-sm">
          <div className="label">{t('deploy.progress.address')}</div>
          <Mono value={p.contractAddress} />
          {p.mode === 'wallet' && (
            <div className="flex flex-wrap gap-3 text-xs">
              <a className="text-accent-soft underline" href={explorerContractUrl(p.contractAddress)} target="_blank" rel="noopener noreferrer">Explorer ↗</a>
              {p.txHash && <a className="text-accent-soft underline" href={explorerTxUrl(p.txHash)} target="_blank" rel="noopener noreferrer">{t('deploy.progress.tx')} {shortHex(p.txHash, 8, 6)} ↗</a>}
            </div>
          )}
        </div>
      )}

      {p.status === 'failed' && p.mode === 'wallet' && (
        <div className="mt-3"><Alert tone="warn"><span className="flex items-start gap-2"><AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />{isAction ? t('action.progress.retryHint') : t('deploy.progress.retryHint')}</span></Alert></div>
      )}

      {p.status !== 'running' && (
        <button type="button" className="btn-ghost mt-3" onClick={dismissDeployProgress}>{t('deploy.progress.dismiss')}</button>
      )}
    </div>
  );
}
