/**
 * Conector: reporte de avance de tutorías por carrera (TIT, Requisito 2 —
 * extensión 2026-07-31) — provider + página. Punto de entrada lazy de la
 * ruta TIT-PROYECTOS-AVANCE-CARRERA (/titulacion/proyectos-grado/reportes/avance-carrera).
 */

import { AvanceTutoriaCarreraProvider } from '@application-titulacion/proyectos-grado/providers/AvanceTutoriaCarreraProvider';
import ReporteAvanceTutoriaCarreraPage from '@titulacion/proyectos-grado/pages/ReporteAvanceTutoriaCarreraPage';

const ReporteAvanceTutoriaCarreraConnector = () => (
  <AvanceTutoriaCarreraProvider>
    <ReporteAvanceTutoriaCarreraPage />
  </AvanceTutoriaCarreraProvider>
);

export default ReporteAvanceTutoriaCarreraConnector;
