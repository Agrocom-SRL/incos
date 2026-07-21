import { useContext } from 'react';
import { ParticipanteFormContext } from '@application-capacitacion/participantes/context/ParticipanteFormContext';

export const useParticipanteFormContext = () => {
  const context = useContext(ParticipanteFormContext);
  if (!context) {
    throw new Error('useParticipanteFormContext debe usarse dentro de ParticipanteFormProvider');
  }
  return context;
};
