import { useDocentesAsignacionAcademicaPage } from '@application-docentes/hooks/state/useDocentesAsignacionAcademicaPage';
import { DocentesAsignacionAcademicaContext } from '@application-docentes/context/DocentesAsignacionAcademicaContext';

export const DocentesAsignacionAcademicaProvider = ({ children }) => {
  const value = useDocentesAsignacionAcademicaPage();
  return <DocentesAsignacionAcademicaContext.Provider value={value}>{children}</DocentesAsignacionAcademicaContext.Provider>;
};

