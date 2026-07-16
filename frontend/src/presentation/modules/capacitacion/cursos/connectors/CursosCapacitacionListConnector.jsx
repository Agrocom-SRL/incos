/**
 * Conector: listado de cursos de capacitación (CAP) — provider + página.
 * Punto de entrada lazy del ítem de menú CAP-CURSOS.
 */

import { CursosCapacitacionListProvider } from '@application-capacitacion/cursos/providers/CursosCapacitacionListProvider';
import CursosCapacitacionList from '@capacitacion/cursos/pages/CursosCapacitacionList';

const CursosCapacitacionListConnector = () => (
  <CursosCapacitacionListProvider>
    <CursosCapacitacionList />
  </CursosCapacitacionListProvider>
);

export default CursosCapacitacionListConnector;
