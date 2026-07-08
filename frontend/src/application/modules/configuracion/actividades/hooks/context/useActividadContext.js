import { useContext } from 'react';
import { ActividadContext } from '../../context/ActividadContext';

export const useActividadContext = () => {
  const context = useContext(ActividadContext);
  if (!context) {
    throw new Error('useActividadContext must be used within ActividadProvider');
  }
  return context;
};
