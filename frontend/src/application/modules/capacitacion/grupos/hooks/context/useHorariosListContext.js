import { useContext } from 'react';
import { HorariosListContext } from '@application-capacitacion/grupos/context/HorariosListContext';

export const useHorariosListContext = () => {
  const context = useContext(HorariosListContext);
  if (!context) {
    throw new Error('useHorariosListContext debe usarse dentro de HorariosListProvider');
  }
  return context;
};
