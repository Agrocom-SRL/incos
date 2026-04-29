import { useContext } from 'react';
import { DocentesAsignacionesGestionContext } from '@application-docentes/context/DocentesAsignacionesGestionContext';

export const useDocentesAsignacionesGestionContext = () => {
  const ctx = useContext(DocentesAsignacionesGestionContext);
  if (!ctx) {
    throw new Error('useDocentesAsignacionesGestionContext debe usarse dentro de DocentesAsignacionesGestionProvider');
  }
  return ctx;
};

