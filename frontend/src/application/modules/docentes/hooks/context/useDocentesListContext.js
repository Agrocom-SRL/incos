import { useContext } from 'react';
import { DocentesListContext } from '@application-docentes/context/DocentesListContext';

export const useDocentesListContext = () => {
  const context = useContext(DocentesListContext);
  if (!context) {
    throw new Error('useDocentesListContext debe usarse dentro de DocentesListProvider');
  }
  return context;
};
