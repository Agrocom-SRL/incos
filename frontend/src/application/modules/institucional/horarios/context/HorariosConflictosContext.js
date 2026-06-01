import { createContext, useContext } from 'react';

export const HorariosConflictosContext = createContext(null);

export function useHorariosConflictosContext() {
  const ctx = useContext(HorariosConflictosContext);
  if (!ctx) {
    throw new Error('useHorariosConflictosContext debe usarse dentro de HorariosConflictosProvider');
  }
  return ctx;
}
