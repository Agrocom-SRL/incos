/**
 * Conector: bandeja de licencias pendientes (ACA-ASI-LIC-APR).
 * Monta LicenciasProvider con el estado fijado a PENDIENTE.
 */

import { LicenciasProvider } from '@application-academico/asistencia/providers/LicenciasProvider.jsx';
import { ESTADOS_LICENCIA } from '@application-academico/asistencia/utils/licenciasEstados.js';
import LicenciasAprobarPage from '../pages/LicenciasAprobarPage.jsx';

const LicenciasAprobarConnector = () => (
  <LicenciasProvider estadoFijo={ESTADOS_LICENCIA.PENDIENTE}>
    <LicenciasAprobarPage />
  </LicenciasProvider>
);

export default LicenciasAprobarConnector;
