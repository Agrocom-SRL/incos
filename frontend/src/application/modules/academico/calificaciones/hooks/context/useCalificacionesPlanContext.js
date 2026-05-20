import { useContext } from 'react';
import { CalificacionesPlanContext } from '../../context/CalificacionesPlanContext.js';

export const useCalificacionesPlanContext = () => {
  const ctx = useContext(CalificacionesPlanContext);
  if (!ctx) {
    throw new Error('useCalificacionesPlanContext debe usarse dentro de CalificacionesPlanProvider');
  }
  return ctx;
};
