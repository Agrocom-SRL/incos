/**
 * Conector: Aporte de la gestión vigente (Finanzas) — provider + página.
 * Punto de entrada lazy de la ruta FIN-APORTES (/finanzas/aportes).
 * Espejo de `ConfigPagosConnector`: ensambla el provider y la página "dumb".
 */

import { AporteProvider } from '@application-finanzas/aportes/providers/AporteProvider';
import AportePage from '@finanzas/aportes/pages/AportePage.jsx';

const AporteConnector = () => (
  <AporteProvider>
    <AportePage />
  </AporteProvider>
);

export default AporteConnector;
