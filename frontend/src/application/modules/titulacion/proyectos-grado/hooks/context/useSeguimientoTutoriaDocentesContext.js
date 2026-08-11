import { useContext } from 'react';
import { SeguimientoTutoriaDocentesContext } from '@application-titulacion/proyectos-grado/context/SeguimientoTutoriaDocentesContext';

export const useSeguimientoTutoriaDocentesContext = () => {
  const context = useContext(SeguimientoTutoriaDocentesContext);
  if (!context) {
    throw new Error(
      'useSeguimientoTutoriaDocentesContext debe usarse dentro de SeguimientoTutoriaDocentesProvider',
    );
  }
  return context;
};
