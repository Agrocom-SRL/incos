/**
 * Conector: Aporte de la gestión vigente (Finanzas · Config. de pagos) — provider + página.
 * Punto de entrada lazy de la ruta FIN-CFG-APORTES (/finanzas/configuracion/aportes).
 * Espejo de `ConfigPagosConnector`: ensambla el provider y la página "dumb".
 */

import { AporteProvider } from '@application-finanzas/aportes/providers/AporteProvider';
import AporteConfigPage from '@finanzas/configuracion/pages/AporteConfigPage.jsx';

const AporteConfigConnector = () => (
  <AporteProvider>
    <AporteConfigPage />
  </AporteProvider>
);

export default AporteConfigConnector;
