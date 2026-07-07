import { useContext } from 'react';
import { EstadoCivilContext } from '../../context/EstadoCivilContext';

export const useEstadoCivilContext = () => {
  const context = useContext(EstadoCivilContext);
  if (!context) {
    throw new Error('useEstadoCivilContext must be used within EstadoCivilProvider');
  }
  return context;
};
