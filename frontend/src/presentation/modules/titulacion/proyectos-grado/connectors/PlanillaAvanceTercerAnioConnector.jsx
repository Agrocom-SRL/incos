/**
 * Conector: planilla de avance de tutorías "10 en 10" (TIT, Requisito 3 —
 * extensión 2026-07-31) — provider + página. Punto de entrada lazy de la
 * ruta TIT-PROYECTOS-PLANILLA-TERCER-ANIO
 * (/titulacion/proyectos-grado/reportes/planilla-tercer-anio).
 */

import { PlanillaAvanceTercerAnioProvider } from '@application-titulacion/proyectos-grado/providers/PlanillaAvanceTercerAnioProvider';
import PlanillaAvanceTercerAnioPage from '@titulacion/proyectos-grado/pages/PlanillaAvanceTercerAnioPage';

const PlanillaAvanceTercerAnioConnector = () => (
  <PlanillaAvanceTercerAnioProvider>
    <PlanillaAvanceTercerAnioPage />
  </PlanillaAvanceTercerAnioProvider>
);

export default PlanillaAvanceTercerAnioConnector;
