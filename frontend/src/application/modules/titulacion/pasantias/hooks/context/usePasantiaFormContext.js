import { useContext } from 'react';
import { PasantiaFormContext } from '@application-titulacion/pasantias/context/PasantiaFormContext';

export const usePasantiaFormContext = () => {
  const context = useContext(PasantiaFormContext);
  if (!context) {
    throw new Error('usePasantiaFormContext debe usarse dentro de PasantiaFormProvider');
  }
  return context;
};
