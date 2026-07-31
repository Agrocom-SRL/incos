import { useContext } from 'react';
import { SesionRefuerzoDetailContext } from '@application-academico/acompanamiento/sesiones/context/SesionRefuerzoDetailContext';

export const useSesionRefuerzoDetailContext = () => {
  const context = useContext(SesionRefuerzoDetailContext);
  if (!context) {
    throw new Error('useSesionRefuerzoDetailContext debe usarse dentro de SesionRefuerzoDetailProvider');
  }
  return context;
};
