import { useContext } from 'react';
import { MateriaContext } from '../../context/MateriaContext';

export const useMateriaContext = () => {
  const context = useContext(MateriaContext);
  if (!context) {
    throw new Error('useMateriaContext must be used within MateriaProvider');
  }
  return context;
};
