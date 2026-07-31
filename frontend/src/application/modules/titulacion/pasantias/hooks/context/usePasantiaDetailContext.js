import { useContext } from 'react';
import { PasantiaDetailContext } from '@application-titulacion/pasantias/context/PasantiaDetailContext';

export const usePasantiaDetailContext = () => {
  const context = useContext(PasantiaDetailContext);
  if (!context) {
    throw new Error('usePasantiaDetailContext debe usarse dentro de PasantiaDetailProvider');
  }
  return context;
};
