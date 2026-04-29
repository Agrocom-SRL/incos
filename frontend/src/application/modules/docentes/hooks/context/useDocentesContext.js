import { useContext } from 'react';
import { DocentesContext } from '@application-docentes/context/DocentesContext';

export const useDocentesContext = () => {
  const context = useContext(DocentesContext);
  if (!context) {
    throw new Error('useDocentesContext debe usarse dentro de DocentesProvider');
  }
  return context;
};
