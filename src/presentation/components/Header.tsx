'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FlaskConical, Wallet, X } from 'lucide-react';
import { KNOWN_WALLETS } from '@/infrastructure/wallet/connector';
import { shortHex } from '@/domain/hex';
import { useApp } from '../providers/AppProvider';
import { LOCALES, useT } from '../i18n';
import { Badge, Spinner } from './ui';

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  const { wallets, connectWallet, connector, rescanWallets } = useApp();
  const connecting = connector.status === 'connecting';

  // Extensions can inject late; look again whenever the picker opens.
  useEffect(() => {
    void rescanWallets();
  }, [rescanWallets]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={t('wallet.choose')}>
      <div className="card w-full max-w-md">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t('wallet.choose')}</h2>
          <button type="button" onClick={onClose} aria-label={t('common.close')} className="btn-ghost !p-1.5">
            <X size={16} />
          </button>
        </div>
        <ul className="space-y-2">
          {KNOWN_WALLETS.map((k) => {
            const found = wallets.find((w) => w.known === k.id);
            return (
              <li key={k.id} className="flex items-center gap-3 rounded-xl border border-midnight-700 bg-midnight-900/60 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {found?.icon ? <img src={found.icon} alt="" className="h-8 w-8 rounded" /> : <Wallet className="text-slate-500" />}
                <div className="flex-1">
                  <div className="font-medium text-white">{k.label}</div>
                  <div className="text-xs text-slate-400">{found ? t('wallet.detected') : t('wallet.notInstalled')}</div>
                </div>
                {found ? (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={connecting}
                    onClick={async () => {
                      await connectWallet(found.key);
                      onClose();
                    }}
                  >
                    {connecting ? <Spinner /> : t('wallet.connect')}
                  </button>
                ) : (
                  <a className="btn-ghost" href={k.installUrl} target="_blank" rel="noopener noreferrer">
                    {t('wallet.install')}
                  </a>
                )}
              </li>
            );
          })}
          {wallets
            .filter((w) => !w.known)
            .map((w) => (
              <li key={w.key} className="flex items-center gap-3 rounded-xl border border-midnight-700 bg-midnight-900/60 p-3">
                <Wallet className="text-slate-500" />
                <div className="flex-1 font-medium text-white">{w.name}</div>
                <button type="button" className="btn-primary" onClick={async () => (await connectWallet(w.key), onClose())}>
                  {t('wallet.connect')}
                </button>
              </li>
            ))}
        </ul>
        {wallets.length === 0 && (
          <p className="mt-3 text-sm text-slate-400">
            {t('wallet.notFound')}{' '}
            <button type="button" className="underline" onClick={() => void rescanWallets()}>
              {t('common.refresh')}
            </button>
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}

export function Header() {
  const { t, locale, setLocale } = useT();
  const { mode, setMode, connector, disconnectWallet } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-midnight-700 bg-midnight-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="mr-auto min-w-0">
          <h1 className="truncate text-lg font-bold text-white">{t('app.title')}</h1>
          <p className="hidden truncate text-xs text-slate-400 sm:block">{t('app.tagline')}</p>
        </div>

        <div role="group" aria-label="Mode" className="flex rounded-lg border border-midnight-600 bg-midnight-900 p-0.5">
          {(['test', 'wallet'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              title={t(m === 'test' ? 'mode.test.hint' : 'mode.wallet.hint')}
              onClick={() => setMode(m)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${mode === m ? 'bg-accent-strong text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {m === 'test' ? <FlaskConical size={14} aria-hidden /> : <Wallet size={14} aria-hidden />}
              {t(m === 'test' ? 'mode.test' : 'mode.wallet')}
            </button>
          ))}
        </div>

        <label className="sr-only" htmlFor="lang">
          {t('common.language')}
        </label>
        <select id="lang" className="input !w-auto !py-1.5" value={locale} onChange={(e) => setLocale(e.target.value as typeof locale)}>
          {LOCALES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>

        {mode === 'wallet' &&
          (connector.status === 'connected' ? (
            <div className="flex items-center gap-2">
              <Badge tone="ok">
                {connector.session.wallet.name} · {shortHex(connector.session.unshieldedAddress ?? connector.session.networkId, 6, 4)}
              </Badge>
              <button type="button" className="btn-ghost" onClick={disconnectWallet}>
                {t('wallet.disconnect')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" className="btn-primary" onClick={() => setOpen(true)} disabled={connector.status === 'connecting'}>
                {connector.status === 'connecting' ? <Spinner /> : <Wallet size={16} aria-hidden />}
                {connector.status === 'connecting' ? t('wallet.connecting') : t('wallet.connect')}
              </button>
              {connector.status === 'connecting' && (
                <button type="button" className="btn-ghost" onClick={disconnectWallet}>
                  {t('common.cancel')}
                </button>
              )}
            </div>
          ))}
      </div>
      {open && <WalletModal onClose={() => setOpen(false)} />}
    </header>
  );
}
