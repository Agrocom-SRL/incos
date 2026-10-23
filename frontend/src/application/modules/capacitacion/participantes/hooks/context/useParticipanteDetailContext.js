import { useContext } from 'react';
import { ParticipanteDetailContext } from '@application-capacitacion/participantes/context/ParticipanteDetailContext';

export const useParticipanteDetailContext = () => {
  const context = useContext(ParticipanteDetailContext);
  if (!context) {
    throw new Error('useParticipanteDetailContext debe usarse dentro de ParticipanteDetailProvider');
  }
  return context;
};
