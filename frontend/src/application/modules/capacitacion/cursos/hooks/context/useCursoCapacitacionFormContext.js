import { useContext } from 'react';
import { CursoCapacitacionFormContext } from '@application-capacitacion/cursos/context/CursoCapacitacionFormContext';

export const useCursoCapacitacionFormContext = () => {
  const context = useContext(CursoCapacitacionFormContext);
  if (!context) {
    throw new Error(
      'useCursoCapacitacionFormContext debe usarse dentro de CursoCapacitacionFormProvider',
    );
  }
  return context;
};
