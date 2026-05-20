import { useContext } from 'react';
import { CalificacionesCursosContext } from '../../context/CalificacionesCursosContext.js';

export const useCalificacionesCursosContext = () => {
  const ctx = useContext(CalificacionesCursosContext);
  if (!ctx) {
    throw new Error('useCalificacionesCursosContext debe usarse dentro de CalificacionesCursosProvider');
  }
  return ctx;
};
