/**
 * Conector: listado de sesiones de refuerzo (TUT) — provider + página.
 * Punto de entrada lazy de la ruta TUT-SESIONES (/tutorias/acompanamiento/sesiones).
 */

import { SesionesListProvider } from '@application-academico/acompanamiento/sesiones/providers/SesionesListProvider';
import SesionesList from '@academico/acompanamiento/sesiones/pages/SesionesList';

const SesionesListConnector = () => (
  <SesionesListProvider>
    <SesionesList />
  </SesionesListProvider>
);

export default SesionesListConnector;
