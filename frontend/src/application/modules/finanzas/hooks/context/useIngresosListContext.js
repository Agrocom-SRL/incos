import { useContext } from 'react';
import { IngresosListContext } from '@application-finanzas/context/IngresosListContext';

export const useIngresosListContext = () => {
  const context = useContext(IngresosListContext);
  if (!context) {
    throw new Error('useIngresosListContext debe usarse dentro de IngresosListProvider');
  }
  return context;
};
