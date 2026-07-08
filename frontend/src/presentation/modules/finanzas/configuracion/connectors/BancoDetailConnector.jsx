/**
 * Conector: ficha de detalle de un banco autorizado (Config. de pagos · Finanzas).
 * Monta su propio `ConfigPagosProvider` (ruta independiente de `/finanzas/configuracion`)
 * porque la ficha resuelve el registro desde el catálogo cruzado (banco + método).
 */

import { ConfigPagosProvider } from '@application-finanzas/providers/ConfigPagosProvider';
import BancoDetailPage from '@finanzas/configuracion/pages/BancoDetailPage.jsx';

const BancoDetailConnector = () => (
  <ConfigPagosProvider>
    <BancoDetailPage />
  </ConfigPagosProvider>
);

export default BancoDetailConnector;
