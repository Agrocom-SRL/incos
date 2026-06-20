/** Contexto i18n (solo la definición — SRP, separado del provider). */
import { createContext } from 'react';

/** @type {import('react').Context<{ locale: string, setLocale: (l: string) => void, t: (key: string, vars?: object) => string }>} */
export const I18nContext = createContext({
  locale: 'es',
  setLocale: () => {},
  t: (key) => key,
});

export default I18nContext;
