import { useContext } from 'react';
import { FichaSeguimientoFormContext } from '@application-docentes/supervision/context/FichaSeguimientoFormContext';

export const useFichaSeguimientoFormContext = () => {
  const context = useContext(FichaSeguimientoFormContext);
  if (!context) {
    throw new Error(
      'useFichaSeguimientoFormContext debe usarse dentro de FichaSeguimientoFormProvider',
    );
  }
  return context;
};
