/**
 * Conector: listado de sesiones de reforzamiento (TUT) — provider + página.
 * Punto de entrada lazy de la ruta TUT-SESIONES (/tutorias/acompanamiento/sesiones).
 */

import { SesionesListProvider } from '@application-tutorias/acompanamiento/sesiones/providers/SesionesListProvider';
import SesionesList from '@tutorias/acompanamiento/sesiones/pages/SesionesList';

const SesionesListConnector = () => (
  <SesionesListProvider>
    <SesionesList />
  </SesionesListProvider>
);

export default SesionesListConnector;
