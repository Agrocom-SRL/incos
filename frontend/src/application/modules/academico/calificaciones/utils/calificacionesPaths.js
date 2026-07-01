/**
 * Rutas del módulo Calificaciones (ítem Académico · ACA-CAL).
 *
 * Flujo: Calificaciones (coordinación) → mis cursos → notas → cuaderno por bimestre.
 * El docente en vista coordinación se pasa por location.state / sesión, no por URL.
 */

export const CALIFICACIONES_PATH = '/academico/calificaciones';

export const POLITICA_INSTITUCIONAL_PATH = '/academico/calificaciones/politica';

export const CALIFICACIONES_GESTION_BIMESTRES_PATH =
  '/academico/calificaciones/gestion-bimestres';

export const MIS_CURSOS_PATH = '/academico/calificaciones/mis-cursos';

/** Portal del estudiante: su boletín (rama ESTUDIANTE del ítem Calificaciones). */
export const MI_BOLETIN_PATH = '/academico/mi-boletin';

/** key de routes.jsx para useRouteViewMode (coordinación vs docente propio). */
export const CALIFICACIONES_VIEW_ROUTE_KEY = 'ACA-CAL-MIS-CURSOS';

export const notasCursoPath = (asignacionId) =>
  `${MIS_CURSOS_PATH}/${asignacionId}/notas`;

export const cuadernoBimestrePath = (asignacionId, bimestre) =>
  `${MIS_CURSOS_PATH}/${asignacionId}/cuaderno/${bimestre}`;

/** Bimestre cerrado — resumen teórico / práctico / total (solo lectura + edición admin). */
export const bimestreConsolidadoPath = (asignacionId, bimestre) =>
  `${MIS_CURSOS_PATH}/${asignacionId}/bimestre/${bimestre}/consolidado`;

export const cursoNivelacionPath = (asignacionId) =>
  `${MIS_CURSOS_PATH}/${asignacionId}/nivelacion`;
