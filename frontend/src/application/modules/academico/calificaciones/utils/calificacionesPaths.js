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

export const notasCursoPath = (asignacionId) =>
  `${MIS_CURSOS_PATH}/${asignacionId}/notas`;

export const cuadernoBimestrePath = (asignacionId, bimestre) =>
  `${MIS_CURSOS_PATH}/${asignacionId}/cuaderno/${bimestre}`;

export const cursoFinalesPath = (asignacionId) =>
  `${MIS_CURSOS_PATH}/${asignacionId}/finales`;

export const cursoNivelacionPath = (asignacionId) =>
  `${MIS_CURSOS_PATH}/${asignacionId}/nivelacion`;
