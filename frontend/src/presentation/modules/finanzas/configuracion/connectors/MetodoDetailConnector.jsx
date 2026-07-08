/**
 * Conector: ficha de detalle de un método de pago (Config. de pagos · Finanzas).
 * Monta su propio `ConfigPagosProvider` (catálogo corto, sin GET /:id).
 */

import { ConfigPagosProvider } from '@application-finanzas/providers/ConfigPagosProvider';
import MetodoDetailPage from '@finanzas/configuracion/pages/MetodoDetailPage.jsx';

const MetodoDetailConnector = () => (
  <ConfigPagosProvider>
    <MetodoDetailPage />
  </ConfigPagosProvider>
);

export default MetodoDetailConnector;
