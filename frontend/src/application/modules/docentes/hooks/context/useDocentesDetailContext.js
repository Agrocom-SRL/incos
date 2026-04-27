import { useContext } from 'react';
import { DocentesDetailContext } from '@application-docentes/context/DocentesDetailContext';

export const useDocentesDetailContext = () => {
  const ctx = useContext(DocentesDetailContext);
  if (!ctx) {
    throw new Error('useDocentesDetailContext debe usarse dentro de DocentesDetailProvider');
  }
  return ctx;
};
