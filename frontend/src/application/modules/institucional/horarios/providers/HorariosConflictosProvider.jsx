import { HorariosConflictosContext } from '../context/HorariosConflictosContext';
import { useGestionHorariosConflictosState } from '../hooks/state/useGestionHorariosConflictosState';

export function HorariosConflictosProvider({ children }) {
  const value = useGestionHorariosConflictosState();
  return (
    <HorariosConflictosContext.Provider value={value}>{children}</HorariosConflictosContext.Provider>
  );
}
