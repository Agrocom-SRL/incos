/**
 * Conector: seguimiento de tutorías a docentes (TIT, extensión 2026-08-10 —
 * reemplaza la planilla de avance "10 en 10" de 3er año) — provider +
 * página. Punto de entrada lazy de la ruta
 * TIT-PROYECTOS-SEGUIMIENTO-TUTORIA-DOCENTES
 * (/titulacion/proyectos-grado/reportes/seguimiento-tutoria-docentes).
 */

import { SeguimientoTutoriaDocentesProvider } from '@application-titulacion/proyectos-grado/providers/SeguimientoTutoriaDocentesProvider';
import SeguimientoTutoriaDocentesPage from '@titulacion/proyectos-grado/pages/SeguimientoTutoriaDocentesPage';

const SeguimientoTutoriaDocentesConnector = () => (
  <SeguimientoTutoriaDocentesProvider>
    <SeguimientoTutoriaDocentesPage />
  </SeguimientoTutoriaDocentesProvider>
);

export default SeguimientoTutoriaDocentesConnector;
