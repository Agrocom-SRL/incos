/**
 * Conector: configuración de pagos (Finanzas) — provider + página.
 * Punto de entrada lazy de la ruta FIN-CFG (/finanzas/configuracion).
 * Espejo de `PagosDetailConnector`: ensambla el provider y la página "dumb".
 */

import { ConfigPagosProvider } from '@application-finanzas/providers/ConfigPagosProvider';
import ConfigPagosPage from '@finanzas/configuracion/pages/ConfigPagosPage.jsx';

const ConfigPagosConnector = () => (
  <ConfigPagosProvider>
    <ConfigPagosPage />
  </ConfigPagosProvider>
);

export default ConfigPagosConnector;
