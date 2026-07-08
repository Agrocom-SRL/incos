import { useContext } from 'react';
import { TipoEvaluacionContext } from '../../context/TipoEvaluacionContext';

export const useTipoEvaluacionContext = () => {
  const context = useContext(TipoEvaluacionContext);
  if (!context) {
    throw new Error('useTipoEvaluacionContext must be used within TipoEvaluacionProvider');
  }
  return context;
};
