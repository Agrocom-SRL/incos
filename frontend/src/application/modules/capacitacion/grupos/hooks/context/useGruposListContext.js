import { useContext } from 'react';
import { GruposListContext } from '@application-capacitacion/grupos/context/GruposListContext';

export const useGruposListContext = () => {
  const context = useContext(GruposListContext);
  if (!context) {
    throw new Error('useGruposListContext debe usarse dentro de GruposListProvider');
  }
  return context;
};
