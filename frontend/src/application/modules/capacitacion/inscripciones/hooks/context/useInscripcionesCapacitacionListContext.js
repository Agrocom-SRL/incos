import { useContext } from 'react';
import { InscripcionesCapacitacionListContext } from '@application-capacitacion/inscripciones/context/InscripcionesCapacitacionListContext';

export const useInscripcionesCapacitacionListContext = () => {
  const context = useContext(InscripcionesCapacitacionListContext);
  if (!context) {
    throw new Error(
      'useInscripcionesCapacitacionListContext debe usarse dentro de InscripcionesCapacitacionListProvider',
    );
  }
  return context;
};
