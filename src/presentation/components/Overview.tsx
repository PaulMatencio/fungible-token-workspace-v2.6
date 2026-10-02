'use client';
import { useState } from 'react';
import { KeyRound, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { formatAmount } from '@/domain/amount';
import { shortHex } from '@/domain/hex';
import { explorerContractUrl } from '@/infrastructure/config/network';
import { parsePubkey } from '@/application/validation';
import { useApp } from '../providers/AppProvider';
import { useT } from '../i18n';
import { Badge, Card, Field, Mono, Stat } from './ui';

export function RoleBanner() {
  const { t } = useT();
  const { role } = useApp();
  if (!role) return null;
  const tone = role.role === 'manager' ? 'warn' : role.role === 'cosigner' ? 'accent' : 'muted';
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-midnight-700 bg-midnight-850/70 px-4 py-3">
      <ShieldCheck className="text-accent-soft" aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={tone}>{t(`role.${role.role}` as const)}</Badge>
          {role.isManager && role.isCosigner && <Badge tone="accent">{t('role.cosigner')}</Badge>}
        </div>
        <p className="mt-1 text-sm text-slate-400">{t(`role.${role.role}.desc` as const)}</p>
      </div>
    </div>
  );
}

export function TokenOverview() {
  const { t } = useT();
  const { state, refresh, guard, gateway, missingCircuits, registerRemainingCircuits, busy, deployProgress } = useApp();
  if (!state) return <Card><p className="text-slate-400">{t('overview.empty')}</p></Card>;
  const fmt = (v: bigint) => formatAmount(v, state.decimals, { group: true });
  const uncapped = state.maxSupply === (1n << 128n) - 1n;
  return (
    <Card
      title={`${state.name} (${state.symbol})`}
      icon={<ShieldCheck size={16} aria-hidden />}
      actions={
        <button type="button" className="btn-ghost !px-2 !py-1" onClick={() => void guard(refresh)} aria-label={t('common.refresh')}>
          <RefreshCw size={14} aria-hidden />
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={t('overview.supply')} value={fmt(state.totalSupply)} sub={state.symbol} />
        <Stat label={t('overview.maxSupply')} value={uncapped ? '∞' : fmt(state.maxSupply)} />
        <Stat label={t('overview.status')} value={<Badge tone={state.paused ? 'bad' : 'ok'}>{state.paused ? t('overview.paused') : t('overview.active')}</Badge>} />
        <Stat label={t('overview.threshold')} value={`${state.multisigThreshold} / ${state.multisigSignerCount}`} sub={`${t('overview.nonce')}: ${state.multisigNonce}`} />
      </div>
      {missingCircuits.length > 0 && (
        <div className="mt-4 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm text-warn">
          <b>{missingCircuits.length}</b> {t('circuits.incomplete')}: <span className="mono">{missingCircuits.join(', ')}</span>
          <p className="mt-1 text-xs opacity-80">{t('circuits.why')}</p>
          <button type="button" className="btn-primary mt-2" disabled={busy || deployProgress?.status === 'running'} onClick={() => void registerRemainingCircuits()}>
            {t('circuits.register')}
          </button>
        </div>
      )}
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="label">{t('overview.address')}</dt>
          <dd>
            <Mono value={state.contractAddress} />
            {gateway?.mode === 'wallet' && (
              <a className="text-xs text-accent-soft underline" href={explorerContractUrl(state.contractAddress)} target="_blank" rel="noopener noreferrer">
                Explorer ↗
              </a>
            )}
          </dd>
        </div>
        <div>
          <dt className="label">{t('overview.owner')}</dt>
          <dd><Mono value={state.owner} /></dd>
        </div>
        <div>
          <dt className="label">{t('overview.pauser')}</dt>
          <dd><Mono value={state.emergencyPauser} /></dd>
        </div>
        <div>
          <dt className="label flex items-center gap-1"><Users size={12} aria-hidden /> {t('overview.signers')}</dt>
          <dd className="space-y-1">
            {state.signerCommitments.map((c) => (
              <div key={c} className="mono text-slate-400" title={c}>{shortHex(c, 16, 10)}</div>
            ))}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

export function IdentityPanel() {
  const { t } = useT();
  const { mode, account, state, gateway, mockAccounts, actors, actorId, setActorId, signerPubkey, setSignerPubkey, exportSecretKey, importSecretKey, exportAuthorityKey, importAuthorityKey, guard } = useApp();
  const [secret, setSecret] = useState('');
  const [shown, setShown] = useState<string | null>(null);
  const [pk, setPk] = useState('');
  const [authShown, setAuthShown] = useState<string | null | undefined>(undefined);
  const [authIn, setAuthIn] = useState('');

  return (
    <Card title={t('identity.title')} icon={<KeyRound size={16} aria-hidden />}>
      {mode === 'test' && (
        <Field label={t('identity.actAs')} htmlFor="actor">
          <select id="actor" className="input" value={actorId} onChange={(e) => setActorId(e.target.value)}>
            {actors.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label={t('identity.account')}>
        {account ? <Mono value={account} /> : <span className="text-sm text-slate-500">—</span>}
      </Field>
      {state && mode === 'test' && actors.length > 0 && (
        <details className="mb-2 text-xs text-slate-400">
          <summary className="cursor-pointer">Mock accounts</summary>
          <ul className="mt-2 space-y-1">
            {actors.map((a) => (
              <li key={a.id}>
                <b className="text-slate-300">{a.label}</b>
                <Mono value={mockAccounts[a.id] ?? ''} />
              </li>
            ))}
          </ul>
        </details>
      )}
      {mode === 'wallet' && (
        <>
          <p className="mb-3 rounded-lg border border-warn/30 bg-warn/10 p-2 text-xs text-warn">{t('identity.warn')}</p>
          <div className="mb-3 flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={async () => setShown(await guard(exportSecretKey) ?? null)}>{t('identity.backup')}</button>
            {shown && <Mono value={shown} />}
          </div>
          <Field label={t('identity.import')} htmlFor="import-sk">
            <div className="flex gap-2">
              <input id="import-sk" className="input" type="password" autoComplete="off" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="64 hex" />
              <button type="button" className="btn-ghost" onClick={async () => { await guard(() => importSecretKey(secret), 'Key imported'); setSecret(''); }}>OK</button>
            </div>
          </Field>
          {gateway?.mode === 'wallet' && (
            <div className="mb-3 rounded-xl border border-midnight-700 bg-midnight-900/50 p-3">
              <div className="label">{t('identity.authority')}</div>
              <p className="mb-2 text-xs text-slate-500">{t('identity.authorityHint')}</p>
              <div className="mb-2 flex flex-wrap items-start gap-2">
                <button type="button" className="btn-ghost" onClick={async () => setAuthShown(await guard(exportAuthorityKey))}>{t('identity.authorityExport')}</button>
                {authShown && <Mono value={authShown} />}
                {authShown === null && <span className="text-xs text-warn">{t('identity.authorityMissing')}</span>}
              </div>
              <div className="flex gap-2">
                <input aria-label={t('identity.authorityImport')} className="input" type="password" autoComplete="off" placeholder={t('identity.authorityImport')} value={authIn} onChange={(e) => setAuthIn(e.target.value)} />
                <button type="button" className="btn-ghost" onClick={async () => { await guard(() => importAuthorityKey(authIn), 'Authority key imported'); setAuthIn(''); setAuthShown(undefined); }}>OK</button>
              </div>
            </div>
          )}
          <Field label={t('identity.signerKey')} hint={t('identity.signerHint')} htmlFor="signer-pk">
            <div className="flex gap-2">
              <input id="signer-pk" className="input" value={pk} onChange={(e) => setPk(e.target.value)} placeholder={signerPubkey ? JSON.stringify(signerPubkey) : '{"x":"…","y":"…"}'} />
              <button type="button" className="btn-ghost" onClick={async () => { await guard(async () => setSignerPubkey(pk.trim() ? parsePubkey(pk) : null)); setPk(''); }}>OK</button>
            </div>
          </Field>
        </>
      )}
    </Card>
  );
}
