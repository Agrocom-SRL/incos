/**
 * Conector: listado de inscripciones de capacitación (CAP) — provider + página.
 * Punto de entrada lazy del ítem de menú CAP-INSCRIPCIONES.
 */

import { InscripcionesCapacitacionListProvider } from '@application-capacitacion/inscripciones/providers/InscripcionesCapacitacionListProvider';
import InscripcionesCapacitacionList from '@capacitacion/inscripciones/pages/InscripcionesCapacitacionList';

const InscripcionesCapacitacionListConnector = () => (
  <InscripcionesCapacitacionListProvider>
    <InscripcionesCapacitacionList />
  </InscripcionesCapacitacionListProvider>
);

export default InscripcionesCapacitacionListConnector;
