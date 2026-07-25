import { useContext } from 'react';
import { SesionReforzamientoDetailContext } from '@application-tutorias/acompanamiento/sesiones/context/SesionReforzamientoDetailContext';

export const useSesionReforzamientoDetailContext = () => {
  const context = useContext(SesionReforzamientoDetailContext);
  if (!context) {
    throw new Error('useSesionReforzamientoDetailContext debe usarse dentro de SesionReforzamientoDetailProvider');
  }
  return context;
};
