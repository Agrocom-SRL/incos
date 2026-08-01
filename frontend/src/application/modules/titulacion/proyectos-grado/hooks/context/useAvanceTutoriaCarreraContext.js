import { useContext } from 'react';
import { AvanceTutoriaCarreraContext } from '@application-titulacion/proyectos-grado/context/AvanceTutoriaCarreraContext';

export const useAvanceTutoriaCarreraContext = () => {
  const context = useContext(AvanceTutoriaCarreraContext);
  if (!context) {
    throw new Error(
      'useAvanceTutoriaCarreraContext debe usarse dentro de AvanceTutoriaCarreraProvider',
    );
  }
  return context;
};
