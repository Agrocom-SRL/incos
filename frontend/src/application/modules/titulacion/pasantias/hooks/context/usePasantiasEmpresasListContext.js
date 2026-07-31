import { useContext } from 'react';
import { PasantiasEmpresasListContext } from '@application-titulacion/pasantias/context/PasantiasEmpresasListContext';

export const usePasantiasEmpresasListContext = () => {
  const context = useContext(PasantiasEmpresasListContext);
  if (!context) {
    throw new Error('usePasantiasEmpresasListContext debe usarse dentro de PasantiasEmpresasListProvider');
  }
  return context;
};
