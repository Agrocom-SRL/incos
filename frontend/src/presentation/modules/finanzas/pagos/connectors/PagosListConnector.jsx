/**
 * Conector: listado de pagos de aporte (Finanzas) — provider + página.
 * Punto de entrada lazy del ítem de menú FIN-PAG.
 */

import { PagosListProvider } from '@application-finanzas/providers/PagosListProvider';
import PagosList from '@finanzas/pagos/pages/PagosList';

const PagosListConnector = () => (
  <PagosListProvider>
    <PagosList />
  </PagosListProvider>
);

export default PagosListConnector;
