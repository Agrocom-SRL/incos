/**
 * Conector: Registro de ingresos (Finanzas) — provider + página.
 * Punto de entrada lazy del ítem de menú FIN-PAG.
 */

import { IngresosListProvider } from '@application-finanzas/providers/IngresosListProvider';
import PagosList from '@finanzas/pagos/pages/PagosList';

const PagosListConnector = () => (
  <IngresosListProvider>
    <PagosList />
  </IngresosListProvider>
);

export default PagosListConnector;
