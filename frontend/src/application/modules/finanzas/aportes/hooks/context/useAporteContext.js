import { useContext } from 'react';
import { AporteContext } from '@application-finanzas/aportes/context/AporteContext';

/** Consume el contexto de la pantalla "Aporte" (Finanzas). */
export const useAporteContext = () => {
  const ctx = useContext(AporteContext);
  if (!ctx) {
    throw new Error('useAporteContext debe usarse dentro de <AporteProvider>');
  }
  return ctx;
};

export default useAporteContext;
