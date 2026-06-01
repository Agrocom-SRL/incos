import { useContext } from 'react';
import { AsignacionDocenteContext } from '@application-institucional/horarios/context';

export function useAsignacionDocenteContext() {
  const ctx = useContext(AsignacionDocenteContext);
  if (!ctx) {
    throw new Error('useAsignacionDocenteContext debe usarse dentro de AsignacionDocenteProvider');
  }
  return ctx;
}
