/**
 * Pill de "resultado" del listado de fichas de seguimiento (módulo DOC ·
 * Supervisión docente, vista 174): documentación presentada («docs n/4») +
 * asistencia observada («asistencia a/p»). Mismo enfoque que
 * `tutoriasPills.js`: clases GLOBALES `cfg-materia-pill--*`, sin CSS propio.
 *
 * Semántica de color: 4/4 = verde (success), 2-3/4 = ámbar (warning),
 * 0-1/4 = rojo semántico del kit (danger).
 */

/** Clase completa del StatusPill según cuántos de los 4 documentos están en SI. */
export const getDocsCompletosPillClass = (docsPresentados) => {
  const n = Number(docsPresentados) || 0;
  if (n >= 4) return 'cfg-materia-pill cfg-materia-pill--success';
  if (n >= 2) return 'cfg-materia-pill cfg-materia-pill--warning';
  return 'cfg-materia-pill cfg-materia-pill--danger';
};

/**
 * Etiqueta del pill de resultado: «docs n/4 · asistencia a/p». Si no hay dato
 * de asistencia (ninguna cantidad registrada), solo muestra la documentación.
 *
 * @param {{ docsPresentados?: number, docsCompletos?: string, estudiantesAsistentes?: number|null, estudiantesEnPlanilla?: number|null }} row
 */
export const formatResultadoFichaLabel = (row = {}) => {
  const docs = row.docsCompletos || `${Number(row.docsPresentados) || 0}/4`;
  const tieneAsistencia = row.estudiantesAsistentes != null || row.estudiantesEnPlanilla != null;
  if (!tieneAsistencia) return `docs ${docs}`;
  const asistentes = row.estudiantesAsistentes ?? '—';
  const planilla = row.estudiantesEnPlanilla ?? '—';
  return `docs ${docs} · asistencia ${asistentes}/${planilla}`;
};
