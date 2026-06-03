const BLOQUEADOS_EDICION_COMPLETA = new Set(['PUBLICADO', 'CERRADO']);
const BLOQUEADOS_PLAN_SEMANAL = new Set(['CERRADO']);

function normalizeEstado(estado) {
  return String(estado || '')
    .trim()
    .toUpperCase();
}

/** Cobertura, generar bloques, alta y baja en grilla. */
/** @param {string|null|undefined} estado */
export function isParaleloGestionHorarioEditable(estado) {
  const s = normalizeEstado(estado);
  return s.length > 0 && !BLOQUEADOS_EDICION_COMPLETA.has(s);
}

/** Arrastrar y guardar reubicaciones en Plan semanal (incluye PUBLICADO). */
/** @param {string|null|undefined} estado */
export function isParaleloGestionPlanSemanalEditable(estado) {
  const s = normalizeEstado(estado);
  return s.length > 0 && !BLOQUEADOS_PLAN_SEMANAL.has(s);
}

/** @param {string|null|undefined} estado */
export function mensajeParaleloGestionNoEditable(estado) {
  const s = normalizeEstado(estado);
  if (s === 'PUBLICADO') {
    return 'Este paralelo ya está PUBLICADO: no se pueden generar bloques nuevos desde Cobertura. En Plan semanal podés reubicar bloques existentes y guardar los cambios.';
  }
  if (s === 'CERRADO') {
    return 'Este paralelo está CERRADO: el plan semanal ya no admite cambios.';
  }
  return 'El paralelo en gestión no admite cambios en el plan semanal en su estado actual.';
}

/** @param {string|null|undefined} estado */
export function mensajeParaleloGestionPlanNoEditable(estado) {
  const s = normalizeEstado(estado);
  if (s === 'CERRADO') {
    return 'Este paralelo está CERRADO: el plan semanal ya no admite cambios.';
  }
  return mensajeParaleloGestionNoEditable(estado);
}
