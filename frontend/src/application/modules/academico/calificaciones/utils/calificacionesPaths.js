/**
 * Rutas del módulo Calificaciones (ítem Académico · ACA-CAL).
 *
 * Flujo: Calificaciones → docentes → mis cursos (por docente) → cuaderno.
 * Páginas aparte: política institucional, tablero de gestión.
 */

export const CALIFICACIONES_PATH = '/academico/calificaciones';

export const POLITICA_INSTITUCIONAL_PATH = '/academico/calificaciones/politica';

export const CALIFICACIONES_TABLERO_PATH = '/academico/calificaciones/tablero';

export const docenteCursosPath = (docenteId) =>
  `/academico/calificaciones/docente/${docenteId}`;

export const docenteCuadernoPath = (docenteId, cursoId) =>
  `/academico/calificaciones/docente/${docenteId}/curso/${cursoId}`;

/** @deprecated Usar docenteCuadernoPath(docenteId, cursoId) */
export const cuadernoCursoPath = docenteCuadernoPath;
