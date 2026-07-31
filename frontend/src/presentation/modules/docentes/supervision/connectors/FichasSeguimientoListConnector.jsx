/**
 * Conector: listado de fichas de seguimiento (DOC) — provider + página.
 * Punto de entrada lazy de la ruta DOC-SUPERVISION (/docentes/supervision).
 */

import { FichasSeguimientoListProvider } from '@application-docentes/supervision/providers/FichasSeguimientoListProvider';
import FichasSeguimientoList from '@docentes/supervision/pages/FichasSeguimientoList';

const FichasSeguimientoListConnector = () => (
  <FichasSeguimientoListProvider>
    <FichasSeguimientoList />
  </FichasSeguimientoListProvider>
);

export default FichasSeguimientoListConnector;
