import { useContext } from 'react';
import { PlanillaAvanceTercerAnioContext } from '@application-titulacion/proyectos-grado/context/PlanillaAvanceTercerAnioContext';

export const usePlanillaAvanceTercerAnioContext = () => {
  const context = useContext(PlanillaAvanceTercerAnioContext);
  if (!context) {
    throw new Error(
      'usePlanillaAvanceTercerAnioContext debe usarse dentro de PlanillaAvanceTercerAnioProvider',
    );
  }
  return context;
};
