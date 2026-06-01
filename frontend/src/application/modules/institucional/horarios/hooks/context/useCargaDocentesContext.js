import { useContext } from 'react';
import { CargaDocentesContext } from '@application-institucional/horarios/context';

export function useCargaDocentesContext() {
  const ctx = useContext(CargaDocentesContext);
  if (!ctx) {
    throw new Error('useCargaDocentesContext debe usarse dentro de CargaDocentesProvider');
  }
  return ctx;
}
