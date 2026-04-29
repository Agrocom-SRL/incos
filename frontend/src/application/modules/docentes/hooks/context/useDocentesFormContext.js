import { useContext } from 'react';
import { DocentesFormContext } from '@application-docentes/context/DocentesFormContext';

export const useDocentesFormContext = () => {
  const ctx = useContext(DocentesFormContext);
  if (!ctx) {
    throw new Error('useDocentesFormContext debe usarse dentro de DocentesFormProvider');
  }
  return ctx;
};

