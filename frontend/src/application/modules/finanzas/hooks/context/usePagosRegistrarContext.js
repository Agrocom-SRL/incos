import { useContext } from 'react';
import { PagosRegistrarContext } from '@application-finanzas/context/PagosRegistrarContext';

export const usePagosRegistrarContext = () => {
  const context = useContext(PagosRegistrarContext);
  if (!context) {
    throw new Error('usePagosRegistrarContext debe usarse dentro de PagosRegistrarProvider');
  }
  return context;
};
