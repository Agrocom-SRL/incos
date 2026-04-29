/**
 * Conector: asignación académica (Provider + página).
 */

import { DocentesAsignacionAcademicaProvider } from '@application-docentes/providers';
import DocentesAsignacionAcademica from '@docentes/pages/DocentesAsignacionAcademica';

const DocentesAsignacionAcademicaConnector = () => (
  <DocentesAsignacionAcademicaProvider>
    <DocentesAsignacionAcademica />
  </DocentesAsignacionAcademicaProvider>
);

export default DocentesAsignacionAcademicaConnector;
