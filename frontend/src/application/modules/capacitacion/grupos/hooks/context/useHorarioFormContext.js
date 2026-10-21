import { useContext } from 'react';
import { HorarioFormContext } from '@application-capacitacion/grupos/context/HorarioFormContext';

export const useHorarioFormContext = () => {
  const context = useContext(HorarioFormContext);
  if (!context) {
    throw new Error('useHorarioFormContext debe usarse dentro de HorarioFormProvider');
  }
  return context;
};
