/**
 * Conector: listado general de licencias estudiantiles (ACA-ASI-LIC).
 * Monta LicenciasProvider (carga + decisión) y la página de listado.
 */

import { LicenciasProvider } from '@application-academico/asistencia/providers/LicenciasProvider.jsx';
import LicenciasListPage from '../pages/LicenciasListPage.jsx';

const LicenciasListConnector = () => (
  <LicenciasProvider>
    <LicenciasListPage />
  </LicenciasProvider>
);

export default LicenciasListConnector;
