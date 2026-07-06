import { useContext } from 'react';
import { IdiomaContext } from '../../context/IdiomaContext';

export const useIdiomaContext = () => {
  const context = useContext(IdiomaContext);
  if (!context) {
    throw new Error('useIdiomaContext must be used within IdiomaProvider');
  }
  return context;
};
