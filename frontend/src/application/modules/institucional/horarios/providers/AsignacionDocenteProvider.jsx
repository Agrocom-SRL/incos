import { AsignacionDocenteContext } from '../context/AsignacionDocenteContext.js';
import { useAsignacionDocenteMatrizState } from '../hooks/state/useAsignacionDocenteMatrizState.js';

export function AsignacionDocenteProvider({ children }) {
  const value = useAsignacionDocenteMatrizState();
  return (
    <AsignacionDocenteContext.Provider value={value}>{children}</AsignacionDocenteContext.Provider>
  );
}
