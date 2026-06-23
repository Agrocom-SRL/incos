import { useContext } from 'react';
import { CuentasPorCobrarContext } from '@application-finanzas/context/CuentasPorCobrarContext';

export const useCuentasPorCobrarContext = () => {
  const context = useContext(CuentasPorCobrarContext);
  if (!context) {
    throw new Error('useCuentasPorCobrarContext debe usarse dentro de CuentasPorCobrarProvider');
  }
  return context;
};

export default useCuentasPorCobrarContext;
