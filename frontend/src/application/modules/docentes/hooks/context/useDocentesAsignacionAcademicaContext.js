import { useContext } from 'react';
import { DocentesAsignacionAcademicaContext } from '@application-docentes/context/DocentesAsignacionAcademicaContext';

export const useDocentesAsignacionAcademicaContext = () => {
  const ctx = useContext(DocentesAsignacionAcademicaContext);
  if (!ctx) {
    throw new Error('useDocentesAsignacionAcademicaContext debe usarse dentro de DocentesAsignacionAcademicaProvider');
  }
  return ctx;
};

