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
    conflictHorarioIds: Array.isArray(payload.conflictHorarioIds)
      ? payload.conflictHorarioIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
      : [],
    bloquesConflictoIds: Array.isArray(payload.bloquesConflictoIds)
      ? payload.bloquesConflictoIds.map((id) => Number(id)).filter((n) => Number.isFinite(n))
      : [],
    solapeParaleloHorarioKeys: Array.isArray(payload.solapeParaleloHorarioKeys)
      ? payload.solapeParaleloHorarioKeys
      : [],
    paresConflicto: Array.isArray(payload.paresConflicto) ? payload.paresConflicto : [],
    lineasDetalle: Array.isArray(payload.lineasDetalle) ? payload.lineasDetalle : [],
  };
}
