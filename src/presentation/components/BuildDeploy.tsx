'use client';
import { useEffect, useState } from 'react';
import { Cog, Rocket } from 'lucide-react';
import type { ToolingAction, ToolingResult, ToolingStatus } from '@/application/ports';
import type { DeployForm } from '@/application/validation';
import { useApp } from '../providers/AppProvider';
import { useT } from '../i18n';
import { DeployProgressPanel } from './DeployProgressPanel';
import { Alert, Badge, Card, Field, Spinner } from './ui';

const STEPS: { action: ToolingAction; label: Parameters<ReturnType<typeof useT>['t']>[0] }[] = [
  { action: 'compile', label: 'tool.compile' },
  { action: 'generate-sdk', label: 'tool.sdk' },
  { action: 'generate-tests', label: 'tool.genTests' },
  { action: 'run-tests', label: 'tool.runTests' }
];

export function ToolingPanel() {
  const { t } = useT();
  const { tooling } = useApp();
  const [status, setStatus] = useState<ToolingStatus | null>(null);
  const [running, setRunning] = useState<ToolingAction | null>(null);
  const [last, setLast] = useState<ToolingResult | null>(null);

  useEffect(() => {
    void tooling.run('status').then((r) => setStatus(r.status ?? null));
  }, [tooling]);

  const run = async (a: ToolingAction) => {
    setRunning(a);
    try {
      const r = await tooling.run(a);
      setLast(r);
      if (r.status) setStatus(r.status);
    } finally {
      setRunning(null);
    }
  };

  return (
    <Card title="midnight.config.json" icon={<Cog size={16} aria-hidden />}>
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge tone={status?.compiled ? 'ok' : 'warn'}>{status?.compiled ? `${t('tool.compiled')} · compactc ${status.compilerVersion}` : t('tool.notCompiled')}</Badge>
        {status?.circuits.length ? <Badge tone="muted">{status.circuits.length} circuits</Badge> : null}
        <Badge tone={status?.sdkGenerated ? 'ok' : 'muted'}>SDK</Badge>
        <Badge tone={status?.testsGenerated ? 'ok' : 'muted'}>Tests</Badge>
      </div>
      {status && !status.enabled && <Alert tone="warn">{t('tool.disabled')}</Alert>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <button key={s.action} type="button" className={i === 0 ? 'btn-primary' : 'btn-ghost'} disabled={!!running || (status ? !status.enabled : false)} onClick={() => void run(s.action)}>
            {running === s.action ? <Spinner /> : null}
            {running === s.action ? t('tool.running') : t(s.label)}
          </button>
        ))}
      </div>
      {last && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone={last.ok ? 'ok' : 'bad'}>{last.action}: {last.ok ? 'OK' : 'FAILED'}</Badge>
            <span className="text-xs text-slate-500">{(last.durationMs / 1000).toFixed(1)}s</span>
          </div>
          {last.tests && (
            <div className="mb-3 rounded-xl border border-midnight-700 bg-midnight-900/60 p-3 text-sm">
              <div className="mb-2 font-medium text-white">
                {last.tests.passed}/{last.tests.total} passed{last.tests.failed ? ` · ${last.tests.failed} failed` : ''}
              </div>
              <ul className="max-h-56 space-y-1 overflow-auto">
                {last.tests.cases.map((c) => (
                  <li key={c.name} className="flex items-start gap-2">
                    <span className={c.status === 'passed' ? 'text-ok' : c.status === 'failed' ? 'text-bad' : 'text-slate-500'} aria-label={c.status}>
                      {c.status === 'passed' ? '✓' : c.status === 'failed' ? '✗' : '–'}
                    </span>
                    <span className="text-slate-300">{c.name}{c.message ? <em className="block text-xs text-bad">{c.message}</em> : null}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {last.files?.length ? <p className="mb-2 mono text-slate-400">{last.files.join('\n')}</p> : null}
          <details>
            <summary className="cursor-pointer text-xs text-slate-400">{t('tool.log')}</summary>
            <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-slate-300">{last.log || '—'}</pre>
          </details>
        </div>
      )}
    </Card>
  );
}

export function DeployPanel() {
  const { t } = useT();
  const { mode, deploy, attach, forget, busy, state, mockSigners, connector, deployProgress } = useApp();
  const deploying = deployProgress?.status === 'running';
  const [form, setForm] = useState<DeployForm>({
    name: 'Midnight Token',
    symbol: 'MDT',
    decimals: '6',
    maxSupply: '0',
    threshold: '2',
    signerPubkeys: ['', '', '']
  });
  const [addr, setAddr] = useState('');
  const set = <K extends keyof DeployForm>(k: K, v: DeployForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const walletReady = mode === 'test' || connector.status === 'connected';

  // Test Mode: pre-fill with the mock cosigners' public keys.
  useEffect(() => {
    if (mode === 'test' && mockSigners.length === 3) {
      setForm((f) => ({ ...f, signerPubkeys: mockSigners.map((s) => JSON.stringify(s.pubkey)) as [string, string, string] }));
    }
  }, [mode, mockSigners]);

  return (
    <Card title={t('deploy.title')} icon={<Rocket size={16} aria-hidden />}>
      <DeployProgressPanel />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void deploy(form);
        }}
      >
        <fieldset disabled={deploying} className="min-w-0 border-0 p-0 disabled:opacity-60">
        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <Field label={t('deploy.name')} htmlFor="d-name"><input id="d-name" className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label={t('deploy.symbol')} htmlFor="d-sym"><input id="d-sym" className="input" required value={form.symbol} onChange={(e) => set('symbol', e.target.value)} /></Field>
          <Field label={t('deploy.decimals')} htmlFor="d-dec"><input id="d-dec" className="input" inputMode="numeric" value={form.decimals} onChange={(e) => set('decimals', e.target.value)} /></Field>
          <Field label={t('deploy.maxSupply')} htmlFor="d-max"><input id="d-max" className="input" inputMode="decimal" value={form.maxSupply} onChange={(e) => set('maxSupply', e.target.value)} /></Field>
          <Field label={t('deploy.threshold')} htmlFor="d-th">
            <select id="d-th" className="input" value={form.threshold} onChange={(e) => set('threshold', e.target.value)}>
              {[1, 2, 3].map((n) => <option key={n} value={n}>{n} of 3</option>)}
            </select>
          </Field>
        </div>
        {[0, 1, 2].map((i) => (
          <Field key={i} label={`${t('deploy.signer')} #${i + 1}`} htmlFor={`d-pk${i}`} hint={i === 0 ? 'signer-tool keygen → {"x":"…","y":"…"}' : undefined}>
            <input
              id={`d-pk${i}`}
              className="input font-mono text-xs"
              required
              readOnly={mode === 'test'}
              value={form.signerPubkeys[i]}
              onChange={(e) => set('signerPubkeys', form.signerPubkeys.map((v, j) => (j === i ? e.target.value : v)) as [string, string, string])}
            />
          </Field>
        ))}
        </fieldset>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={busy || deploying || !walletReady}>
          {deploying ? <Spinner /> : <Rocket size={16} aria-hidden />}
          {t('deploy.submit')}
        </button>
        {!walletReady && <p className="mt-2 text-xs text-warn">{t('wallet.connect')}</p>}
      </form>

      {mode === 'wallet' && (
        <form
          className="mt-6 border-t border-midnight-700 pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            void attach(addr);
          }}
        >
          <Field label={t('deploy.attach')} htmlFor="d-addr">
            <div className="flex gap-2">
              <input id="d-addr" className="input font-mono text-xs" placeholder={t('deploy.address')} value={addr} onChange={(e) => setAddr(e.target.value)} />
              <button type="submit" className="btn-ghost" disabled={busy || !walletReady}>{t('deploy.attachBtn')}</button>
            </div>
          </Field>
        </form>
      )}
      {state && (
        <button type="button" className="btn-danger mt-4" onClick={() => void forget()}>
          {t('deploy.reset')}
        </button>
      )}
    </Card>
  );
}
