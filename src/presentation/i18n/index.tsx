'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type MessageKey } from './en';
import { fr } from './fr';

export type Locale = 'en' | 'fr';
export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' }
];
const dictionaries: Record<Locale, Record<MessageKey, string>> = { en, fr };

interface I18n {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (k: MessageKey) => string;
}
const Ctx = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('locale') as Locale | null;
      const nav = navigator.language.slice(0, 2) as Locale;
      const pick = saved && saved in dictionaries ? saved : nav in dictionaries ? nav : 'en';
      setLocaleState(pick);
    } catch {
      /* storage blocked */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem('locale', l);
    } catch {
      /* storage blocked */
    }
  }, []);
  const value = useMemo<I18n>(() => ({ locale, setLocale, t: (k) => dictionaries[locale][k] ?? en[k] }), [locale, setLocale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useT(): I18n {
  const c = useContext(Ctx);
  if (!c) throw new Error('useT must be used inside <I18nProvider>');
  return c;
}
export type { MessageKey };
