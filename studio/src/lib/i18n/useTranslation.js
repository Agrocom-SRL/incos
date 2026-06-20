/** Hook de traducción: { t, locale, setLocale }. SRP: solo lectura del contexto. */
import { useContext } from 'react';
import { I18nContext } from './I18nContext';

export function useTranslation() {
  return useContext(I18nContext);
}

export default useTranslation;
