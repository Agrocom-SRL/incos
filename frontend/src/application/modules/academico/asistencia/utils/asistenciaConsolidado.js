/**
 * Reglas de presentación del Consolidado % de asistencia (ACA-ASI-CONS).
 *
 * El % de la celda replica la regla de la actividad ASISTENCIA del cuaderno
 * (AUSENTE = 1 falta, RETRASO = 0.5, licencia APROBADA neutraliza), por lo que
 * el % se lee en la MISMA escala que una nota sobre 100: bajo el umbral de
 * aprobación institucional (61) la celda se marca en riesgo con el token
 * semántico de error del theme. Es un refuerzo visual, no una regla persistida.
 */

/** Umbral visual de riesgo del % (espejo de la nota mínima de aprobación 61). */
export const PCT_ASISTENCIA_RIESGO = 61;

/** Bimestres del régimen anual (selector del consolidado). */
export const BIMESTRES_CONSOLIDADO = [1, 2, 3, 4];

/**
 * Formatea un % con 1 decimal en locale es-BO (paridad con el Excel del
 * consolidado). `null`/no numérico → '—'.
 *
 * @param {number|null} value
 * @returns {string}
 */
export const formatPctAsistencia = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};
