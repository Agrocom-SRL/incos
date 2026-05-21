/**
 * Rutas del módulo Calificaciones (ítem Académico · ACA-CAL).
 *
 * Flujo: Calificaciones → docentes → mis cursos (por docente) → consolidado → cuaderno / finales / nivelación.
 * Páginas aparte: política institucional, gestión de bimestres.
 */

export const CALIFICACIONES_PATH = '/academico/calificaciones';

export const POLITICA_INSTITUCIONAL_PATH = '/academico/calificaciones/politica';

export const CALIFICACIONES_GESTION_BIMESTRES_PATH =
  '/academico/calificaciones/gestion-bimestres';

export const docenteCursosPath = (docenteId) =>
  `/academico/calificaciones/docente/${docenteId}`;

export const consolidadoCursoPath = (docenteId, asignacionId) =>
  `/academico/calificaciones/docente/${docenteId}/curso/${asignacionId}`;

export const cuadernoBimestrePath = (docenteId, asignacionId, bimestre) =>
  `${consolidadoCursoPath(docenteId, asignacionId)}/bimestre/${bimestre}`;

export const cursoFinalesPath = (docenteId, asignacionId) =>
  `${consolidadoCursoPath(docenteId, asignacionId)}/finales`;

export const cursoNivelacionPath = (docenteId, asignacionId) =>
  `${consolidadoCursoPath(docenteId, asignacionId)}/nivelacion`;
