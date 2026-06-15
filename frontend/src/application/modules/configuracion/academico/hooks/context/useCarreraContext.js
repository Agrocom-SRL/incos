import { useContext } from 'react';
import { CarreraContext } from '../../context/CarreraContext';

export const useCarreraContext = () => {
  const context = useContext(CarreraContext);
  if (!context) {
    throw new Error('useCarreraContext must be used within CarreraProvider');
  }
  return context;
};
