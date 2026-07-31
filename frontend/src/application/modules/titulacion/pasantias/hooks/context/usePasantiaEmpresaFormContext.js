import { useContext } from 'react';
import { PasantiaEmpresaFormContext } from '@application-titulacion/pasantias/context/PasantiaEmpresaFormContext';

export const usePasantiaEmpresaFormContext = () => {
  const context = useContext(PasantiaEmpresaFormContext);
  if (!context) {
    throw new Error('usePasantiaEmpresaFormContext debe usarse dentro de PasantiaEmpresaFormProvider');
  }
  return context;
};
