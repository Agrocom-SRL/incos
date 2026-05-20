import { CalificacionesPlanContext } from '../context/CalificacionesPlanContext.js';
import { useCalificacionesPlanPage } from '../hooks/useCalificacionesPlanPage.js';

export const CalificacionesPlanProvider = ({ children }) => {
  const value = useCalificacionesPlanPage();
  return (
    <CalificacionesPlanContext.Provider value={value}>{children}</CalificacionesPlanContext.Provider>
  );
};
