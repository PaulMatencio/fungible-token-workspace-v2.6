'use client';
import { useState } from 'react';
import { Activity, Boxes, Hammer, History } from 'lucide-react';
import { AppProvider, useApp } from '../providers/AppProvider';
import { I18nProvider, useT, type MessageKey } from '../i18n';
import { BuildDeployPanels } from './BuildDeployTab';
import { DeployProgressPanel } from './DeployProgressPanel';
import { HistoryPanel } from './History';
import { Header } from './Header';
import { OperationsTab } from './Operations';
import { IdentityPanel, RoleBanner, TokenOverview } from './Overview';
import { Alert } from './ui';

const TABS: { id: string; label: MessageKey; icon: typeof Boxes }[] = [
  { id: 'overview', label: 'nav.overview', icon: Boxes },
  { id: 'setup', label: 'nav.setup', icon: Hammer },
  { id: 'operations', label: 'nav.operations', icon: Activity },
  { id: 'history', label: 'nav.history', icon: History }
];

function Body() {
  const { t } = useT();
  const { error, clearError, notice, mode, connector } = useApp();
  const [tab, setTab] = useState('overview');
  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <div className="space-y-2" aria-live="polite">
          {error && <Alert tone="bad" onClose={clearError}>{error}</Alert>}
          {notice && <Alert tone="ok">{notice}</Alert>}
          {mode === 'wallet' && connector.status === 'error' && <Alert tone="bad">{connector.error.message}</Alert>}
        </div>
        <RoleBanner />
        <nav aria-label="Sections" className="flex gap-1 overflow-x-auto rounded-xl border border-midnight-700 bg-midnight-900/70 p-1">
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              aria-current={tab === x.id ? 'page' : undefined}
              onClick={() => setTab(x.id)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${tab === x.id ? 'bg-accent-strong text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <x.icon size={16} aria-hidden />
              {t(x.label)}
            </button>
          ))}
        </nav>
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <DeployProgressPanel />
              <TokenOverview />
            </div>
            <IdentityPanel />
          </div>
        )}
        {tab === 'setup' && <BuildDeployPanels />}
        {tab === 'operations' && <OperationsTab />}
        {tab === 'history' && <HistoryPanel />}
      </main>
    </>
  );
}

export function AppShell() {
  return (
    <I18nProvider>
      <AppProvider>
        <Body />
      </AppProvider>
    </I18nProvider>
  );
}
