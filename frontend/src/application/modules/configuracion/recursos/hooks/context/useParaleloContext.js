import { useContext } from 'react';
import { ParaleloContext } from '../../context/ParaleloContext';

export const useParaleloContext = () => {
  const ctx = useContext(ParaleloContext);
  if (!ctx) {
    throw new Error('useParaleloContext debe usarse dentro de ParaleloProvider');
  }
  return ctx;
};
