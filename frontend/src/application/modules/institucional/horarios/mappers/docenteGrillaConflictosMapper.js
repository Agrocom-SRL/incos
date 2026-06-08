/**
 * Normaliza GET /horarios/docentes/:id/grilla-conflictos → estado de la pantalla de resolución.
 */
export function mapDocenteGrillaConflictosFromApi(raw) {
  const payload = raw?.grilla_conflictos ?? raw?.grillaConflictos ?? raw;
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  return {
    docenteId: payload.docenteId != null ? Number(payload.docenteId) : null,
    docenteNombre: payload.docenteNombre ?? null,
    colorHex: payload.colorHex ?? null,
    turnoEfectivo: payload.turnoEfectivo ?? null,
    courseSchedules: Array.isArray(payload.courseSchedules) ? payload.courseSchedules : [],
    franjas: Array.isArray(payload.franjas) ? payload.franjas : [],
    paralelosInvolucrados: Array.isArray(payload.paralelosInvolucrados)
      ? payload.paralelosInvolucrados
      : [],
    bloquesEnConflicto: Array.isArray(payload.bloquesEnConflicto)
      ? payload.bloquesEnConflicto.map((id) => Number(id)).filter((n) => Number.isFinite(n))
      : [],
    paresConflicto: Array.isArray(payload.paresConflicto) ? payload.paresConflicto : [],
    lineasDetalle: Array.isArray(payload.lineasDetalle) ? payload.lineasDetalle : [],
  };
}
