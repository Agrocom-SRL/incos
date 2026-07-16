import { useContext } from 'react';
import { InscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/context/InscripcionCapacitacionDetailContext';

export const useInscripcionCapacitacionDetailContext = () => {
  const context = useContext(InscripcionCapacitacionDetailContext);
  if (!context) {
    throw new Error(
      'useInscripcionCapacitacionDetailContext debe usarse dentro de InscripcionCapacitacionDetailProvider',
    );
  }
  return context;
};
