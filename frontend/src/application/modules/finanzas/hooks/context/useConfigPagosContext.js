import { useContext } from 'react';
import { ConfigPagosContext } from '@application-finanzas/context/ConfigPagosContext';

/** Consume el contexto de la pantalla "Config. de pagos" (Finanzas). */
export const useConfigPagosContext = () => {
  const ctx = useContext(ConfigPagosContext);
  if (!ctx) {
    throw new Error('useConfigPagosContext debe usarse dentro de <ConfigPagosProvider>');
  }
  return ctx;
};

export default useConfigPagosContext;
