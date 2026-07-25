import { useContext } from 'react';
import { SesionReforzamientoFormContext } from '@application-tutorias/acompanamiento/sesiones/context/SesionReforzamientoFormContext';

export const useSesionReforzamientoFormContext = () => {
  const context = useContext(SesionReforzamientoFormContext);
  if (!context) {
    throw new Error('useSesionReforzamientoFormContext debe usarse dentro de SesionReforzamientoFormProvider');
  }
  return context;
};
