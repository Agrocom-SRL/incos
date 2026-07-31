import { useContext } from 'react';
import { FichasSeguimientoListContext } from '@application-docentes/supervision/context/FichasSeguimientoListContext';

export const useFichasSeguimientoListContext = () => {
  const context = useContext(FichasSeguimientoListContext);
  if (!context) {
    throw new Error(
      'useFichasSeguimientoListContext debe usarse dentro de FichasSeguimientoListProvider',
    );
  }
  return context;
};
