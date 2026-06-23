/**
 * Conector: planilla de control de becas por carrera (Finanzas) — provider + página.
 * Punto de entrada lazy de la subruta FIN-REP-BECAS.
 */

import { BecasReporteProvider } from '@application-finanzas/providers/BecasReporteProvider';
import BecasReportePage from '@finanzas/reportes/pages/BecasReportePage';

const BecasReporteConnector = () => (
  <BecasReporteProvider>
    <BecasReportePage />
  </BecasReporteProvider>
);

export default BecasReporteConnector;
