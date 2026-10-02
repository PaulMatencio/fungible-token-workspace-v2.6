'use client';
import { History as HistoryIcon } from 'lucide-react';
import { shortHex } from '@/domain/hex';
import { explorerTxUrl } from '@/infrastructure/config/network';
import { useApp } from '../providers/AppProvider';
import { useT } from '../i18n';
import { Badge, Card } from './ui';

export function HistoryPanel() {
  const { t } = useT();
  const { txs, clearHistory } = useApp();
  return (
    <Card
      title={t('hist.title')}
      icon={<HistoryIcon size={16} aria-hidden />}
      actions={txs.length ? <button type="button" className="btn-ghost !px-2 !py-1 text-xs" onClick={() => void clearHistory()}>{t('hist.clear')}</button> : null}
    >
      {txs.length === 0 ? (
        <p className="text-sm text-slate-400">{t('hist.empty')}</p>
      ) : (
        <ul className="divide-y divide-midnight-700">
          {txs.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
              <Badge tone={x.status === 'failed' ? 'bad' : 'ok'}>{x.circuit}</Badge>
              <span className="text-xs text-slate-500">{new Date(x.at).toLocaleString()}</span>
              <Badge tone="muted">{x.mode}</Badge>
              {x.blockHeight !== undefined && <span className="text-xs text-slate-500">#{x.blockHeight}</span>}
              {x.txHash ? (
                x.mode === 'wallet' ? (
                  <a className="mono text-accent-soft underline" href={explorerTxUrl(x.txHash)} target="_blank" rel="noopener noreferrer">{shortHex(x.txHash, 10, 8)}</a>
                ) : (
                  <span className="mono text-slate-400">{shortHex(x.txHash, 10, 8)}</span>
                )
              ) : null}
              {x.error && <span className="w-full text-xs text-bad">{x.error}</span>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
