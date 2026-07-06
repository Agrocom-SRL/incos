import { useContext } from 'react';
import { ApoderadoContext } from '../../context/ApoderadoContext';

export const useApoderadoContext = () => {
  const context = useContext(ApoderadoContext);
  if (!context) {
    throw new Error('useApoderadoContext must be used within ApoderadoProvider');
  }
  return context;
};
