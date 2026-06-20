/**
 * I18nProvider — estado del idioma activo + función de traducción.
 *
 * Responsabilidad ÚNICA: gobernar el locale. Persiste la preferencia y expone `t`
 * ligado al diccionario activo. Los componentes consumen useTranslation().
 */
import { useCallback, useMemo, useState } from 'react';
import { activeBrand } from '@config/brand';
import { dictionaries, availableLocales } from './locales';
import { translate } from './translate';
import { I18nContext } from './I18nContext';

const STORAGE_KEY = 'studio-locale';

function readInitialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && availableLocales.includes(saved)) return saved;
  } catch {
    /* ignore */
  }
  return availableLocales.includes(activeBrand.defaultLocale)
    ? activeBrand.defaultLocale
    : 'es';
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readInitialLocale);

  const setLocale = useCallback((next) => {
    if (!availableLocales.includes(next)) return;
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => {
    const dict = dictionaries[locale] ?? dictionaries.es;
    return {
      locale,
      setLocale,
      t: (key, vars) => translate(dict, key, vars),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export default I18nProvider;
