'use client';
import { useState } from 'react';
import { Coins, Search } from 'lucide-react';
import { formatAmount } from '@/domain/amount';
import { useApp } from '../providers/AppProvider';
import { useT } from '../i18n';
import { ActionForm } from './ActionForm';
import { ActionProgressPanel } from './DeployProgressPanel';
import { MultisigWizard, RequestReview } from './Multisig';
import { Alert, Badge, Card, Field } from './ui';

export function HolderOps() {
  const { t } = useT();
  const { tokenService: s, state } = useApp();
  if (!s || !state) return null;
  return (
    <Card title={t('op.transfer')} icon={<Coins size={16} aria-hidden />} className="lg:col-span-2">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ActionForm id="transfer" title={t('op.transfer')} disabled={state.paused} fields={[
          { name: 'to', label: t('ops.recipient'), mono: true },
          { name: 'amount', label: t('ops.amount'), inputMode: 'decimal' }
        ]} onSubmit={(v) => s.transfer(v.to ?? '', v.amount ?? '')} />
        <ActionForm id="approve" title={t('op.approve')} disabled={state.paused} fields={[
          { name: 'spender', label: t('ops.spender'), mono: true },
          { name: 'amount', label: t('ops.amount'), inputMode: 'decimal' }
        ]} onSubmit={(v) => s.approve(v.spender ?? '', v.amount ?? '')} />
        <ActionForm id="transferFrom" title={t('op.transferFrom')} disabled={state.paused} fields={[
          { name: 'from', label: t('ops.from'), mono: true },
          { name: 'to', label: t('ops.recipient'), mono: true },
          { name: 'amount', label: t('ops.amount'), inputMode: 'decimal' }
        ]} onSubmit={(v) => s.transferFrom(v.from ?? '', v.to ?? '', v.amount ?? '')} />
        <ActionForm id="selfBurn" title={t('op.selfBurn')} danger disabled={state.paused} fields={[
          { name: 'amount', label: t('ops.amount'), inputMode: 'decimal' }
        ]} onSubmit={(v) => s.selfBurn(v.amount ?? '')} />
      </div>
      {state.paused && <div className="mt-3"><Alert tone="warn">{t('overview.paused')}</Alert></div>}
    </Card>
  );
}

export function QueryPanel() {
  const { t } = useT();
  const { tokenService: s, state, account, guard } = useApp();
  const [acct, setAcct] = useState('');
  const [owner, setOwner] = useState('');
  const [spender, setSpender] = useState('');
  const [bal, setBal] = useState<bigint | null>(null);
  const [allow, setAllow] = useState<{ v: bigint; approved: boolean } | null>(null);
  if (!s || !state) return null;
  const fmt = (v: bigint) => `${formatAmount(v, state.decimals, { group: true })} ${state.symbol}`;

  return (
    <Card title={t('ops.readOnly')} icon={<Search size={16} aria-hidden />}>
      <div className="mb-4 rounded-xl border border-midnight-700 bg-midnight-900/50 p-3">
        <Field label={t('ops.balance')} htmlFor="q-acct">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id="q-acct" className="input font-mono text-xs" placeholder={account ?? ''} value={acct} onChange={(e) => setAcct(e.target.value)} />
            <button type="button" className="btn-ghost" onClick={async () => setBal((await guard(() => s.balanceOf(acct || account || ''))) ?? null)}>{t('ops.query')}</button>
          </div>
        </Field>
        {bal !== null && <Badge tone="accent">{fmt(bal)}</Badge>}
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-400">
          {t('overview.supply')}: <b className="text-white">{fmt(state.totalSupply)}</b>
        </div>
      </div>
      <div className="rounded-xl border border-midnight-700 bg-midnight-900/50 p-3">
        <Field label={`${t('ops.allowance')} · ${t('ops.owner')}`} htmlFor="q-owner">
          <input id="q-owner" className="input font-mono text-xs" placeholder={account ?? ''} value={owner} onChange={(e) => setOwner(e.target.value)} />
        </Field>
        <Field label={t('ops.spender')} htmlFor="q-spender">
          <input id="q-spender" className="input font-mono text-xs" value={spender} onChange={(e) => setSpender(e.target.value)} />
        </Field>
        <button type="button" className="btn-ghost" onClick={async () => {
          const v = await guard(async () => {
            const o = owner || account || '';
            const amount = await s.allowance(o, spender);
            return { v: amount, approved: amount > 0n };
          });
          setAllow(v ?? null);
        }}>{t('ops.query')}</button>
        {allow && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="accent">{fmt(allow.v)}</Badge>
            <Badge tone={allow.approved ? 'ok' : 'muted'}>{t('ops.approvalStatus')}: {allow.approved ? t('ops.approved') : t('ops.notApproved')}</Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

export function PauserOps() {
  const { t } = useT();
  const { tokenService: s, state, role, account } = useApp();
  if (!s || !state || !role) return null;
  const isPauser = account === state.emergencyPauser;
  if (!role.isManager && !isPauser) return null;
  return (
    <Card title={t('role.manager')} className="lg:col-span-1">
      <div className="space-y-3">
        <ActionForm id="pause" title={t('op.pause')} danger fields={[]} disabled={state.paused} onSubmit={() => s.pause()} />
        <ActionForm id="unpause" title={t('op.unpause')} fields={[]} disabled={!state.paused} onSubmit={() => s.unpause()} />
        {role.isManager && (
          <ActionForm id="ew" title={t('op.emergencyWithdraw')} danger disabled={!state.paused} fields={[{ name: 'amount', label: t('ops.amount'), inputMode: 'decimal' }]} onSubmit={(v) => s.emergencyWithdraw(v.amount ?? '')} />
        )}
      </div>
    </Card>
  );
}

export function OperationsTab() {
  const { role, state } = useApp();
  const { t } = useT();
  if (!state || !role) return <Card><p className="text-slate-400">{t('overview.empty')}</p></Card>;
  const canGovern = role.isManager || role.isCosigner;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="lg:col-span-2"><ActionProgressPanel /></div>
      <HolderOps />
      <QueryPanel />
      <PauserOps />
      {canGovern && (
        <div className="lg:col-span-2">
          <MultisigWizard allowed={['mint', 'burn', 'setEmergencyPauser', 'adminReallocate', 'rotateSigner']} />
        </div>
      )}
      {role.isCosigner && <RequestReview />}
    </div>
  );
}
