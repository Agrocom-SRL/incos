/**
 * Conector: listado de sesiones de refuerzo (ACA) — provider + página.
 *
 * `embedded`: pestaña «Sesiones de refuerzo» del contenedor Seguimiento
 * académico (ACA-SEGUIMIENTO) — mismo provider, contenido sin shell de página.
 */

import { SesionesListProvider } from '@application-academico/acompanamiento/sesiones/providers/SesionesListProvider';
import SesionesList from '@academico/acompanamiento/sesiones/pages/SesionesList';

const SesionesListConnector = ({ embedded = false }) => (
  <SesionesListProvider>
    <SesionesList embedded={embedded} />
  </SesionesListProvider>
);

export default SesionesListConnector;
