/**
 * Conector: asignación académica (sin provider hasta existan casos de uso / catálogos).
 */

import { DocentesAsignacionAcademicaProvider } from '@application-docentes/providers';
import DocentesAsignacionAcademica from '@docentes/pages/DocentesAsignacionAcademica';

const DocentesAsignacionAcademicaConnector = () => (
  <DocentesAsignacionAcademicaProvider>
    <DocentesAsignacionAcademica />
  </DocentesAsignacionAcademicaProvider>
);

export default DocentesAsignacionAcademicaConnector;
