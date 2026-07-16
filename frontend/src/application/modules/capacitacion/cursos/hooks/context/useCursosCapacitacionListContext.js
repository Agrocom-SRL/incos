import { useContext } from 'react';
import { CursosCapacitacionListContext } from '@application-capacitacion/cursos/context/CursosCapacitacionListContext';

export const useCursosCapacitacionListContext = () => {
  const context = useContext(CursosCapacitacionListContext);
  if (!context) {
    throw new Error(
      'useCursosCapacitacionListContext debe usarse dentro de CursosCapacitacionListProvider',
    );
  }
  return context;
};
