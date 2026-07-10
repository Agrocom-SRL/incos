/**
 * Reglas de negocio del builder drag & drop de asignaturas por periodo
 * (`usePlanBuilder.js` / `PlanPeriodoAsignaturasPage.jsx`). Funciones puras,
 * sin estado ni I/O — testeables aisladas.
 *
 * Validación SOLO client-side (decisión explícita, ver prompt de la tarea):
 * el backend no impone tope de horas por periodo ni orden de prerrequisitos
 * por número de periodo, así que llamar la API directo puede violar estas
 * reglas. Riesgo aceptado para este alcance (no se toca `backend/`).
 */

/**
 * Horas semanales aún disponibles en un periodo, según el tope único del
 * plan (`planes_estudios.horas_semana`, ver `05-estructura-academica-parte1.sql`)
 * menos lo ya ocupado por las asignaturas del periodo.
 *
 * @param {{ asignaturas?: Array<{ horas_semanales?: number }> }} periodo
 * @param {number} planHorasSemana
 * @returns {number} horas disponibles (nunca negativo)
 */
export const horasDisponiblesPeriodo = (periodo, planHorasSemana) => {
  const tope = Number(planHorasSemana) || 0;
  const ocupadas = (periodo?.asignaturas ?? []).reduce(
    (sum, asignatura) => sum + (Number(asignatura?.horas_semanales) || 0),
    0,
  );
  return Math.max(tope - ocupadas, 0);
};

/**
 * Un prerrequisito solo es válido si su periodo de origen es ESTRICTAMENTE
 * anterior (numero menor) al periodo de la asignatura que lo requiere. El
 * grano del plan es siempre año académico (`periodos.numero`), nunca semestre.
 *
 * @param {number} periodoOrigenNumero  número del periodo de la asignatura arrastrada (prerrequisito candidato)
 * @param {number} periodoDestinoNumero número del periodo en edición (builder)
 */
export const esPeriodoAnterior = (periodoOrigenNumero, periodoDestinoNumero) => {
  const origen = Number(periodoOrigenNumero);
  const destino = Number(periodoDestinoNumero);
  if (!Number.isFinite(origen) || !Number.isFinite(destino)) return false;
  return origen < destino;
};
