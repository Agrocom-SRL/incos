import { useContext } from 'react';
import { DiscapacidadContext } from '../context/DiscapacidadContext';

export const useDiscapacidadContext = () => {
  const context = useContext(DiscapacidadContext);
  if (!context) {
    throw new Error('useDiscapacidadContext debe usarse dentro de DiscapacidadProvider');
  }
  return context;
};

