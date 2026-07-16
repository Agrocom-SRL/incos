import { useContext } from 'react';
import { CursoCapacitacionDetailContext } from '@application-capacitacion/cursos/context/CursoCapacitacionDetailContext';

export const useCursoCapacitacionDetailContext = () => {
  const context = useContext(CursoCapacitacionDetailContext);
  if (!context) {
    throw new Error(
      'useCursoCapacitacionDetailContext debe usarse dentro de CursoCapacitacionDetailProvider',
    );
  }
  return context;
};
