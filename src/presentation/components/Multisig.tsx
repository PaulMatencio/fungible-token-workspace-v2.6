'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileCheck2, PenLine, Upload } from 'lucide-react';
import type { OpInput } from '@/application/multisigService';
import { AppError } from '@/domain/errors';
import { shortHex } from '@/domain/hex';
import type { ApprovalFile, SigningRequest } from '@/domain/multisig';
import type { MessageKey } from '../i18n';
import { derivePublicKey, makeApprovalFile, pointToJson, randomScalar, signerCommitment, pointFromJson } from '@/infrastructure/crypto/signing';
import { useApp } from '../providers/AppProvider';
import { useT } from '../i18n';
import { Alert, Badge, Card, Field, Mono, Spinner } from './ui';
import { CheckCircle2, Circle, CircleDot } from 'lucide-react';

type OpType = OpInput['type'];
const OPS: { type: OpType; label: MessageKey }[] = [
  { type: 'mint', label: 'op.mint' },
  { type: 'burn', label: 'op.burn' },
  { type: 'setEmergencyPauser', label: 'op.setEmergencyPauser' },
  { type: 'adminReallocate', label: 'op.adminReallocate' },
  { type: 'rotateSigner', label: 'op.rotateSigner' }
];

const FIELDS: Record<OpType, { name: string; label: string; mono?: boolean }[]> = {
  mint: [{ name: 'to', label: 'Recipient account', mono: true }, { name: 'amount', label: 'Amount' }],
  burn: [{ name: 'account', label: 'Treasury (owner) account', mono: true }, { name: 'amount', label: 'Amount' }],
  setEmergencyPauser: [{ name: 'newPauser', label: 'New pauser account', mono: true }],
  adminReallocate: [
    { name: 'trappedAccount', label: 'From (trapped) account', mono: true },
    { name: 'targetSpendableAccount', label: 'To account', mono: true },
    { name: 'amount', label: 'Amount' }
  ],
  rotateSigner: [
    { name: 'oldSignerCommitment', label: 'Signer commitment to remove', mono: true },
    { name: 'newSignerPubkey', label: 'Incoming signer public key {"x","y"}', mono: true }
  ]
};

function download(name: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

type FlowState = 'done' | 'active' | 'pending';

/** Visible multisig roadmap: create → collect → (proof of possession) → submit, with live status. */
function FlowStepper({ steps }: { steps: { label: string; state: FlowState; detail?: string }[] }) {
  return (
    <ol className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Multisig steps">
      {steps.map((st, i) => (
        <li key={st.label} aria-current={st.state === 'active' ? 'step' : undefined} className={`flex items-start gap-2 rounded-xl border p-2 text-sm ${st.state === 'done' ? 'border-ok/40 bg-ok/5' : st.state === 'active' ? 'border-accent/50 bg-accent/10' : 'border-midnight-700 bg-midnight-900/40'}`}>
          {st.state === 'done' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden /> : st.state === 'active' ? <CircleDot size={18} className="mt-0.5 shrink-0 text-accent-soft" aria-hidden /> : <Circle size={18} className="mt-0.5 shrink-0 text-midnight-500" aria-hidden />}
          <div className="min-w-0">
            <div className={st.state === 'pending' ? 'text-slate-500' : 'text-slate-100'}><span className="mr-1 text-xs text-slate-500">{i + 1}.</span>{st.label}</div>
            {st.detail && <div className="text-xs text-slate-400">{st.detail}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function MultisigWizard({ allowed }: { allowed: OpType[] }) {
  const { t } = useT();
  const { mode, state, gateway, multisig, mockSigners, guard, refresh, busy, drafts } = useApp();
  const [type, setType] = useState<OpType>(allowed[0] ?? 'mint');
  const [values, setValues] = useState<Record<string, string>>({});
  const [req, setReq] = useState<SigningRequest | null>(null);
  const [approvals, setApprovals] = useState<ApprovalFile[]>([]);
  const [pop, setPop] = useState<ApprovalFile | null>(null);
  const [paste, setPaste] = useState('');
  const [popPaste, setPopPaste] = useState('');
  const [newSigner, setNewSigner] = useState<{ sk: bigint; pk: ReturnType<typeof derivePublicKey> } | null>(null);

  const address = gateway?.contractAddress;
  const loaded = useRef<string | null>(null);

  // Restore an in-progress operation after a reload / navigation.
  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    void drafts.load(address).then((d) => {
      if (cancelled) return;
      if (d) {
        setType(d.type as OpType);
        setValues(d.values);
        setReq(d.request);
        setApprovals(d.approvals);
        setPop(d.pop);
      }
      loaded.current = address; // only start saving after the restore, so we never overwrite a draft with empty state
    });
    return () => {
      cancelled = true;
      loaded.current = null;
    };
  }, [address, drafts]);

  // Persist every change (request, approvals, PoP, form values).
  useEffect(() => {
    if (!address || loaded.current !== address) return;
    const empty = !req && approvals.length === 0 && !pop && Object.values(values).every((v) => !v);
    if (empty) void drafts.clear(address);
    else void drafts.save(address, { type, values, request: req, approvals, pop });
  }, [address, drafts, type, values, req, approvals, pop]);

  const digest = useMemo(() => (req && multisig ? multisig.digestHex(req) : ''), [req, multisig]);
  if (!state || !multisig) return null;

  const reset = () => {
    setReq(null);
    setApprovals([]);
    setPop(null);
    setPaste('');
    setPopPaste('');
  };

  const create = () =>
    guard(async () => {
      // Always bind the request to the chain's current nonce, not a possibly stale UI copy.
      const fresh = gateway ? await gateway.getState() : state;
      const r = multisig.buildRequest(fresh, { type, ...values } as OpInput);
      setReq(r);
      setApprovals([]);
      setPop(null);
    });

  const addApproval = (text: string, isPop = false) =>
    guard(async () => {
      if (!req) return;
      const f = multisig.acceptApproval(req, state, text, isPop);
      if (isPop) setPop(f);
      else {
        const dup = approvals.some((a) => a.publicKey.x === f.publicKey.x && a.publicKey.y === f.publicKey.y);
        if (dup) throw new AppError('VALIDATION', 'This signer already approved');
        setApprovals((a) => [...a, f]);
      }
      isPop ? setPopPaste('') : setPaste('');
    });

  const signMock = (id: string) =>
    guard(async () => {
      if (!req) return;
      const s = mockSigners.find((m) => m.id === id);
      if (!s) return;
      await addApproval(JSON.stringify(makeApprovalFile(req, s.sk, s.pk)));
    });

  const genNewSigner = () => {
    const sk = randomScalar();
    const pk = derivePublicKey(sk);
    setNewSigner({ sk, pk });
    setValues((v) => ({ ...v, newSignerPubkey: JSON.stringify(pointToJson(pk)) }));
  };

  const signPopMock = () =>
    guard(async () => {
      if (!req || !newSigner) return;
      await addApproval(JSON.stringify(makeApprovalFile(req, newSigner.sk, newSigner.pk, 'pop')), true);
    });

  const submit = () =>
    guard(async () => {
      if (!req) return;
      await multisig.submit(req, approvals, pop ?? undefined);
      reset();
      setValues({});
      await refresh();
    }, `${t(OPS.find((o) => o.type === type)!.label)}: ${t('ops.success')}`);

  const needsPop = req?.op.type === 'rotateSigner';
  const need = multisig.requiredApprovals(state);
  const collected = approvals.length >= need;
  const ready = !!req && collected && (!needsPop || !!pop);
  const flow: { label: string; state: FlowState; detail?: string }[] = [
    { label: t('ms.flow.create'), state: req ? 'done' : 'active', detail: req ? `${t('ms.nonce')} ${req.nonce}` : undefined },
    { label: t('ms.flow.collect'), state: !req ? 'pending' : collected ? 'done' : 'active', detail: req ? `${approvals.length}/${need}` : undefined },
    ...(type === 'rotateSigner' ? [{ label: t('ms.flow.pop'), state: (!req || !collected ? 'pending' : pop ? 'done' : 'active') as FlowState }] : []),
    { label: t('ms.flow.submit'), state: ready ? 'active' : 'pending' }
  ];

  const onFile = async (f: File | undefined, isPop: boolean) => {
    if (f) await addApproval(await f.text(), isPop);
  };

  return (
    <Card title={t('ms.title')} icon={<PenLine size={16} aria-hidden />}>
      <p className="mb-3 text-xs text-slate-400">{t('ms.offlineHint')}</p>
      <FlowStepper steps={flow} />

      <h3 className="mb-2 text-sm font-semibold text-white">{t('ms.step1')}</h3>
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Operation">
        {OPS.filter((o) => allowed.includes(o.type)).map((o) => (
          <button key={o.type} type="button" role="tab" aria-selected={type === o.type} disabled={!!req} onClick={() => { setType(o.type); setValues({}); }} className={type === o.type ? 'btn-primary' : 'btn-ghost'}>
            {t(o.label)}
          </button>
        ))}
      </div>
      <fieldset disabled={!!req} className="disabled:opacity-60">
        {FIELDS[type].map((f) => (
          <Field key={f.name} label={f.label} htmlFor={`ms-${f.name}`}>
            {f.name === 'oldSignerCommitment' ? (
              <select id={`ms-${f.name}`} className="input font-mono text-xs" value={values[f.name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}>
                <option value="">—</option>
                {state.signerCommitments.map((c) => <option key={c} value={c}>{shortHex(c, 16, 10)}</option>)}
              </select>
            ) : (
              <input id={`ms-${f.name}`} className={`input ${f.mono ? 'font-mono text-xs' : ''}`} autoComplete="off" spellCheck={false} value={values[f.name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
            )}
          </Field>
        ))}
        {mode === 'test' && type === 'burn' && (
          <button type="button" className="btn-ghost mb-3" onClick={() => setValues((v) => ({ ...v, account: state.owner }))}>Use owner account</button>
        )}
        {type === 'rotateSigner' && mode === 'test' && (
          <button type="button" className="btn-ghost mb-3" onClick={genNewSigner}>Generate mock incoming signer</button>
        )}
      </fieldset>
      {!req ? (
        <button type="button" className="btn-primary" onClick={() => void create()}>{t('ms.create')}</button>
      ) : (
        <div className="space-y-4">
          {req.nonce !== state.multisigNonce.toString() && (
            <Alert tone="warn">{t('ms.stale')} ({req.nonce} ≠ {state.multisigNonce.toString()})</Alert>
          )}
          <div className="rounded-xl border border-midnight-700 bg-midnight-900/60 p-3 text-sm">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge tone="accent">{req.op.type}</Badge>
              <Badge tone="muted">{t('ms.nonce')} {req.nonce}</Badge>
            </div>
            <div className="label">{t('ms.digest')}</div>
            <Mono value={digest} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" onClick={() => download(`request-${req.op.type}-${req.nonce}.json`, req)}>
                <Download size={14} aria-hidden /> {t('ms.download')}
              </button>
              <button type="button" className="btn-ghost" onClick={reset}>{t('ms.reset')}</button>
            </div>
            <p className="mt-2 text-xs text-ok">{t('ms.saved')}</p>
            <p className="mt-2 mono text-slate-500">signer-tool sign --key you.key.json --request request.json --out approval.json{needsPop ? '  (+ --pop for the incoming signer)' : ''}</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">
              {t('ms.step2')} <Badge tone={collected ? 'ok' : 'warn'}>{approvals.length}/{need} {t('ms.need')}</Badge>
            </h3>
            <ul className="mb-2 space-y-1">
              {approvals.map((a) => (
                <li key={`${a.publicKey.x}`} className="flex items-center gap-2 text-xs text-slate-300">
                  <FileCheck2 size={14} className="text-ok" aria-hidden />
                  <span className="mono">{shortHex(signerCommitment(pointFromJson(a.publicKey), state.contractSalt), 12, 8)}</span>
                </li>
              ))}
            </ul>
            {need > state.multisigThreshold && !collected && (
              <p className="mb-2 rounded-lg border border-warn/30 bg-warn/10 p-2 text-xs text-warn">{t('ms.flow.needAll')}</p>
            )}
            <Field label={t('ms.paste')} htmlFor="ms-paste">
              <textarea id="ms-paste" rows={3} className="input font-mono text-xs" value={paste} onChange={(e) => setPaste(e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" disabled={!paste.trim()} onClick={() => void addApproval(paste)}>{t('ms.add')}</button>
              <label className="btn-ghost cursor-pointer">
                <Upload size={14} aria-hidden /> JSON
                <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0], false)} />
              </label>
              {mode === 'test' &&
                mockSigners.map((s) => (
                  <button key={s.id} type="button" className="btn-ghost" onClick={() => void signMock(s.id)} disabled={busy}>
                    {t('ms.signMock')} {s.label.slice(-1)}
                  </button>
                ))}
            </div>
            {needsPop && (
              <div className="mt-4">
                <Field label={t('ms.pop')} htmlFor="ms-pop">
                  <textarea id="ms-pop" rows={2} className="input font-mono text-xs" value={popPaste} onChange={(e) => setPopPaste(e.target.value)} />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-ghost" disabled={!popPaste.trim()} onClick={() => void addApproval(popPaste, true)}>{t('ms.add')}</button>
                  {mode === 'test' && newSigner && <button type="button" className="btn-ghost" onClick={() => void signPopMock()}>{t('ms.signMock')} (incoming)</button>}
                  {pop && <Badge tone="ok">PoP ✓</Badge>}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">{t('ms.step3')}</h3>
            <button type="button" className="btn-primary" disabled={!ready || busy} onClick={() => void submit()}>
              {busy && <Spinner />} {t('ms.submit')}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

/** Cosigner tool: recompute a request's digest and compare it with the chain before signing offline. */
export function RequestReview() {
  const { t } = useT();
  const { state, multisig } = useApp();
  const [text, setText] = useState('');
  const result = useMemo(() => {
    if (!text.trim() || !state || !multisig) return null;
    try {
      const req = JSON.parse(text) as SigningRequest;
      const digest = multisig.digestHex(req);
      const matches = req.contractAddress.toLowerCase() === state.contractAddress.toLowerCase() && req.nonce === state.multisigNonce.toString();
      return { ok: true as const, req, digest, matches };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [text, state, multisig]);

  return (
    <Card title={t('ms.review')} icon={<FileCheck2 size={16} aria-hidden />}>
      <p className="mb-2 text-xs text-slate-400">{t('ms.reviewHint')}</p>
      <textarea aria-label={t('ms.review')} rows={5} className="input font-mono text-xs" value={text} onChange={(e) => setText(e.target.value)} />
      {result && !result.ok && <div className="mt-3"><Alert tone="bad">{result.error}</Alert></div>}
      {result && result.ok && (
        <div className="mt-3 space-y-2">
          <Alert tone={result.matches ? 'ok' : 'bad'}>{result.matches ? t('ms.matches') : t('ms.mismatch')}</Alert>
          <pre className="max-h-48 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-slate-300">{JSON.stringify(result.req.op, null, 2)}</pre>
          <div className="label">{t('ms.digest')}</div>
          <Mono value={result.digest} />
        </div>
      )}
    </Card>
  );
}
