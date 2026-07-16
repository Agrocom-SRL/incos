import { useContext } from 'react';
import { ParticipantesListContext } from '@application-capacitacion/participantes/context/ParticipantesListContext';

export const useParticipantesListContext = () => {
  const context = useContext(ParticipantesListContext);
  if (!context) {
    throw new Error(
      'useParticipantesListContext debe usarse dentro de ParticipantesListProvider',
    );
  }
  return context;
};
