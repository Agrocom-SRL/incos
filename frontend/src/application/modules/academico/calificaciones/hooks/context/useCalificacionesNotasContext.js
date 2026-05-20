import { useContext } from 'react';
import { CalificacionesNotasContext } from '../../context/CalificacionesNotasContext.js';

export const useCalificacionesNotasContext = () => {
  const ctx = useContext(CalificacionesNotasContext);
  if (!ctx) {
    throw new Error('useCalificacionesNotasContext debe usarse dentro de CalificacionesNotasProvider');
  }
  return ctx;
};
