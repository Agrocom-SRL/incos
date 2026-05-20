import { CalificacionesCursosContext } from '../context/CalificacionesCursosContext.js';
import { useCalificacionesCursosPage } from '../hooks/useCalificacionesCursosPage.js';

export const CalificacionesCursosProvider = ({ children }) => {
  const value = useCalificacionesCursosPage();
  return (
    <CalificacionesCursosContext.Provider value={value}>{children}</CalificacionesCursosContext.Provider>
  );
};
