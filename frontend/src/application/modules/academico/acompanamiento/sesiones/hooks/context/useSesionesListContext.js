import { useContext } from 'react';
import { SesionesListContext } from '@application-academico/acompanamiento/sesiones/context/SesionesListContext';

export const useSesionesListContext = () => {
  const context = useContext(SesionesListContext);
  if (!context) {
    throw new Error('useSesionesListContext debe usarse dentro de SesionesListProvider');
  }
  return context;
};
