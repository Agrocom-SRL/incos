import { useContext } from 'react';
import { BecaDescuentoContext } from '@application-finanzas/becas-descuentos/context/BecaDescuentoContext';

/** Consume el contexto del catálogo maestro "Becas y descuentos" (Finanzas). */
export const useBecaDescuentoContext = () => {
  const ctx = useContext(BecaDescuentoContext);
  if (!ctx) {
    throw new Error('useBecaDescuentoContext debe usarse dentro de <BecaDescuentoProvider>');
  }
  return ctx;
};

export default useBecaDescuentoContext;
