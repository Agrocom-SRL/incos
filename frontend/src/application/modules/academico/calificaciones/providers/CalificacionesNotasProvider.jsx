import { CalificacionesNotasContext } from '../context/CalificacionesNotasContext.js';
import { useCalificacionesNotasPage } from '../hooks/useCalificacionesNotasPage.js';

export const CalificacionesNotasProvider = ({ children }) => {
  const value = useCalificacionesNotasPage();
  return (
    <CalificacionesNotasContext.Provider value={value}>{children}</CalificacionesNotasContext.Provider>
  );
};
