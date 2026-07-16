import { useContext } from 'react';
import { InscribirParticipanteContext } from '@application-capacitacion/inscripciones/context/InscribirParticipanteContext';

export const useInscribirParticipanteContext = () => {
  const context = useContext(InscribirParticipanteContext);
  if (!context) {
    throw new Error(
      'useInscribirParticipanteContext debe usarse dentro de InscribirParticipanteProvider',
    );
  }
  return context;
};
