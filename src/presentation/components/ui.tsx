'use client';
import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { useT } from '../i18n';

export function Card({ title, icon, children, className = '', actions }: { title?: string; icon?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`card ${className}`}>
      {title && (
        <h2 className="card-title">
          {icon}
          <span className="flex-1">{title}</span>
          {actions}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Field({ label, children, hint, htmlFor }: { label: string; children: ReactNode; hint?: string; htmlFor?: string }) {
  return (
    <div className="mb-3">
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Badge({ tone = 'accent', children }: { tone?: 'accent' | 'ok' | 'warn' | 'bad' | 'muted'; children: ReactNode }) {
  const tones = {
    accent: 'border-accent/40 bg-accent/10 text-accent-soft',
    ok: 'border-ok/40 bg-ok/10 text-ok',
    warn: 'border-warn/40 bg-warn/10 text-warn',
    bad: 'border-bad/40 bg-bad/10 text-bad',
    muted: 'border-midnight-600 bg-midnight-800 text-slate-400'
  } as const;
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const { t } = useT();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost !px-2 !py-1 text-xs"
      aria-label={label ?? t('common.copy')}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      {done ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      <span className="sr-only sm:not-sr-only">{done ? t('common.copied') : t('common.copy')}</span>
    </button>
  );
}

export function Mono({ value, copy = true }: { value: string; copy?: boolean }) {
  return (
    <span className="flex items-start gap-2">
      <span className="mono flex-1 text-slate-300">{value}</span>
      {copy && <CopyButton value={value} />}
    </span>
  );
}

export function Alert({ tone, children, onClose }: { tone: 'bad' | 'ok' | 'warn'; children: ReactNode; onClose?: () => void }) {
  const tones = { bad: 'border-bad/40 bg-bad/10 text-bad', ok: 'border-ok/40 bg-ok/10 text-ok', warn: 'border-warn/40 bg-warn/10 text-warn' };
  return (
    <div role={tone === 'bad' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      <div className="flex-1 break-words">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}

export function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />;
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-xl border border-midnight-700 bg-midnight-900/60 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 break-words text-lg font-semibold text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
