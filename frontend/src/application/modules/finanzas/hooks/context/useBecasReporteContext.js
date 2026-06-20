import { useContext } from 'react';
import { BecasReporteContext } from '@application-finanzas/context/BecasReporteContext';

export const useBecasReporteContext = () => {
  const context = useContext(BecasReporteContext);
  if (!context) {
    throw new Error('useBecasReporteContext debe usarse dentro de BecasReporteProvider');
  }
  return context;
};

export default useBecasReporteContext;
