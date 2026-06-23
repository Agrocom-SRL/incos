import { useContext } from 'react';
import { PagosListContext } from '@application-finanzas/context/PagosListContext';

export const usePagosListContext = () => {
  const context = useContext(PagosListContext);
  if (!context) {
    throw new Error('usePagosListContext debe usarse dentro de PagosListProvider');
  }
  return context;
};
