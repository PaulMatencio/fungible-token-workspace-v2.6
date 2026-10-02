'use client';
import { useState } from 'react';
import type { TxReceipt } from '@/domain/token';
import { useApp } from '../providers/AppProvider';
import { useT } from '../i18n';
import { Field, Spinner } from './ui';

export interface FieldSpec {
  name: string;
  label: string;
  placeholder?: string;
  mono?: boolean;
  inputMode?: 'decimal' | 'text';
}

/** Small controlled form: validates through the service layer, reports via the app-wide guard. */
export function ActionForm({
  id,
  title,
  fields,
  submitLabel,
  danger,
  onSubmit,
  disabled
}: {
  id: string;
  title: string;
  fields: FieldSpec[];
  submitLabel?: string;
  danger?: boolean;
  disabled?: boolean;
  onSubmit: (values: Record<string, string>) => Promise<TxReceipt>;
}) {
  const { t } = useT();
  const { guard, refresh, busy } = useApp();
  const [values, setValues] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  return (
    <form
      className="rounded-xl border border-midnight-700 bg-midnight-900/50 p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const r = await guard(async () => {
          const receipt = await onSubmit(values);
          await refresh();
          return receipt;
        }, `${title}: ${t('ops.success')}`);
        setPending(false);
        if (r) setValues({});
      }}
    >
      <h3 className="mb-2 text-sm font-semibold text-white">{title}</h3>
      {fields.map((f) => (
        <Field key={f.name} label={f.label} htmlFor={`${id}-${f.name}`}>
          <input
            id={`${id}-${f.name}`}
            className={`input ${f.mono ? 'font-mono text-xs' : ''}`}
            value={values[f.name] ?? ''}
            placeholder={f.placeholder}
            inputMode={f.inputMode}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
          />
        </Field>
      ))}
      <button type="submit" className={danger ? 'btn-danger' : 'btn-primary'} disabled={busy || disabled}>
        {pending && <Spinner />}
        {submitLabel ?? t('ops.submit')}
      </button>
    </form>
  );
}
