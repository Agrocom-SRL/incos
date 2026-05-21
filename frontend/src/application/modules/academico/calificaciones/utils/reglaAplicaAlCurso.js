import { ALCANCE_EVALUACION_FINAL } from './evaluacionesFinalesReglas.js';

const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

/**
 * Indica si una regla institucional de evaluación final aplica al curso actual.
 * @param {Object} regla
 * @param {{ carreraNombre?: string, periodoNombre?: string }} curso
 */
export const reglaAplicaAlCurso = (regla, curso = {}) => {
  const alcance = regla?.alcance ?? ALCANCE_EVALUACION_FINAL.GESTION;
  const carrera = norm(curso.carreraNombre);
  const periodo = norm(curso.periodoNombre);

  if (alcance === ALCANCE_EVALUACION_FINAL.GESTION) return true;

  if (alcance === ALCANCE_EVALUACION_FINAL.CARRERA) {
    if (!regla.carreraNombre && regla.carreraId == null) return true;
    return norm(regla.carreraNombre) === carrera;
  }

  if (alcance === ALCANCE_EVALUACION_FINAL.PERIODO) {
    if (!regla.periodoNombre && regla.periodoId == null) return true;
    return norm(regla.periodoNombre) === periodo;
  }

  if (alcance === ALCANCE_EVALUACION_FINAL.CARRERA_PERIODO) {
    const okCarrera =
      !regla.carreraNombre && regla.carreraId == null
        ? true
        : norm(regla.carreraNombre) === carrera;
    const okPeriodo =
      !regla.periodoNombre && regla.periodoId == null
        ? true
        : norm(regla.periodoNombre) === periodo;
    return okCarrera && okPeriodo;
  }

  return true;
};
