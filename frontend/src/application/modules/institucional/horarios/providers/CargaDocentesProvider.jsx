import { CargaDocentesContext } from '../context/CargaDocentesContext.js';
import { useCargaDocentesDashboardState } from '../hooks/state/useCargaDocentesDashboardState.js';

export function CargaDocentesProvider({ children }) {
  const value = useCargaDocentesDashboardState();
  return <CargaDocentesContext.Provider value={value}>{children}</CargaDocentesContext.Provider>;
}
