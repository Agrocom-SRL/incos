import { useContext } from 'react';
import { PasantiaEmpresaDetailContext } from '@application-titulacion/pasantias/context/PasantiaEmpresaDetailContext';

export const usePasantiaEmpresaDetailContext = () => {
  const context = useContext(PasantiaEmpresaDetailContext);
  if (!context) {
    throw new Error(
      'usePasantiaEmpresaDetailContext debe usarse dentro de PasantiaEmpresaDetailProvider',
    );
  }
  return context;
};
