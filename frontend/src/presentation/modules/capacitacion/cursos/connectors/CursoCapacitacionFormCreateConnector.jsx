/**
 * Conector: alta de curso de capacitación (CAP) — provider + página en modo create.
 * Punto de entrada lazy de la ruta CAP-CURSOS-REGISTRAR (/capacitacion/cursos/registrar).
 */

import { CursoCapacitacionFormProvider } from '@application-capacitacion/cursos/providers/CursoCapacitacionFormProvider';
import CursoCapacitacionFormPage from '@capacitacion/cursos/pages/CursoCapacitacionFormPage';

const CursoCapacitacionFormCreateConnector = () => (
  <CursoCapacitacionFormProvider>
    <CursoCapacitacionFormPage mode="create" />
  </CursoCapacitacionFormProvider>
);

export default CursoCapacitacionFormCreateConnector;
