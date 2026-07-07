/**
 * Conector: ficha de detalle de una cuenta de pago (Config. de pagos · Finanzas).
 * Monta su propio `ConfigPagosProvider` porque la ficha resuelve el registro
 * desde el catálogo cruzado (cuenta + banco + método).
 */

import { ConfigPagosProvider } from '@application-finanzas/providers/ConfigPagosProvider';
import CuentaDetailPage from '@finanzas/configuracion/pages/CuentaDetailPage.jsx';

const CuentaDetailConnector = () => (
  <ConfigPagosProvider>
    <CuentaDetailPage />
  </ConfigPagosProvider>
);

export default CuentaDetailConnector;
