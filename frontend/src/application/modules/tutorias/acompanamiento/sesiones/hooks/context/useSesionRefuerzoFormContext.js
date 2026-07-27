import { useContext } from 'react';
import { SesionRefuerzoFormContext } from '@application-tutorias/acompanamiento/sesiones/context/SesionRefuerzoFormContext';

export const useSesionRefuerzoFormContext = () => {
  const context = useContext(SesionRefuerzoFormContext);
  if (!context) {
    throw new Error('useSesionRefuerzoFormContext debe usarse dentro de SesionRefuerzoFormProvider');
  }
  return context;
};
