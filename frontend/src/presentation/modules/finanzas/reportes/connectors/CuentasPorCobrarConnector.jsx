/**
 * Conector: planilla de cuentas por cobrar por carrera y paralelo (Finanzas) —
 * provider + página. Punto de entrada lazy de la subruta FIN-REP-CUENTAS-COBRAR.
 */

import { CuentasPorCobrarProvider } from '@application-finanzas/providers/CuentasPorCobrarProvider';
import CuentasPorCobrarPage from '@finanzas/reportes/pages/CuentasPorCobrarPage';

const CuentasPorCobrarConnector = () => (
  <CuentasPorCobrarProvider>
    <CuentasPorCobrarPage />
  </CuentasPorCobrarProvider>
);

export default CuentasPorCobrarConnector;
