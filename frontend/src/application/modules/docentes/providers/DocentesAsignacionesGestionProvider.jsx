import { useDocentesAsignacionesGestionPage } from '@application-docentes/hooks/state/useDocentesAsignacionesGestionPage';
import { DocentesAsignacionesGestionContext } from '@application-docentes/context/DocentesAsignacionesGestionContext';

export const DocentesAsignacionesGestionProvider = ({ children, docenteId }) => {
  const value = useDocentesAsignacionesGestionPage(docenteId);
  return <DocentesAsignacionesGestionContext.Provider value={value}>{children}</DocentesAsignacionesGestionContext.Provider>;
};

