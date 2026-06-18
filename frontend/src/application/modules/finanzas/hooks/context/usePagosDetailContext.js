import { useContext } from 'react';
import { PagosDetailContext } from '@application-finanzas/context/PagosDetailContext';

export const usePagosDetailContext = () => {
  const context = useContext(PagosDetailContext);
  if (!context) {
    throw new Error('usePagosDetailContext debe usarse dentro de PagosDetailProvider');
  }
  return context;
};
