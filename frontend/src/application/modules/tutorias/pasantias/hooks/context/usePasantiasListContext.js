import { useContext } from 'react';
import { PasantiasListContext } from '@application-tutorias/pasantias/context/PasantiasListContext';

export const usePasantiasListContext = () => {
  const context = useContext(PasantiasListContext);
  if (!context) {
    throw new Error('usePasantiasListContext debe usarse dentro de PasantiasListProvider');
  }
  return context;
};
