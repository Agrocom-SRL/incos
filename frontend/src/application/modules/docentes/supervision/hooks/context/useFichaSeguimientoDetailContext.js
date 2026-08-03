import { useContext } from 'react';
import { FichaSeguimientoDetailContext } from '@application-docentes/supervision/context/FichaSeguimientoDetailContext';

export const useFichaSeguimientoDetailContext = () => {
  const context = useContext(FichaSeguimientoDetailContext);
  if (!context) {
    throw new Error(
      'useFichaSeguimientoDetailContext debe usarse dentro de FichaSeguimientoDetailProvider',
    );
  }
  return context;
};
