/**
 * Rutas del flujo de calificaciones (selección → cursos → plan / notas).
 */

export const CALIFICACIONES_SELECCION_PATH = '/academico/calificaciones';

export function calificacionesCursosPath(docenteId) {
  return `/academico/calificaciones/docente/${docenteId}/cursos`;
}

export function calificacionesPlanPath(docenteId, asignacionId) {
  return `/academico/calificaciones/docente/${docenteId}/curso/${asignacionId}/plan`;
}

export function calificacionesNotasPath(docenteId, asignacionId) {
  return `/academico/calificaciones/docente/${docenteId}/curso/${asignacionId}/notas`;
}
