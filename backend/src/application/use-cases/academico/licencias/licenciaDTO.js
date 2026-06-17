/**
 * Mapeo de fila plana (raw query) → DTO de presentación de licencia estudiantil.
 * Contrato front↔back: las claves coinciden con el `dataKey` del frontend.
 * @see docs/plan/MODULO-ASISTENCIA.md §8.
 *
 * @param {Object} row - fila de LicenseRepository.{findAllWithStudentName,findByIdWithStudentName}
 * @returns {Object|null}
 */
export function toLicenciaDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    inscripcionId: row.inscripcion_id ?? null,
    estudianteNombre: row.estudiante_nombre ?? null,
    fechaSolicitud: row.fecha_solicitud ?? null,
    fechaInicio: row.fecha_inicio ?? null,
    fechaFin: row.fecha_fin ?? null,
    totalDias: row.total_dias ?? null,
    motivo: row.motivo ?? null,
    detalleMotivo: row.detalle_motivo ?? null,
    estado: row.estado ?? null,
    motivoRechazo: row.motivo_rechazo ?? null,
    observacionesDecision: row.observaciones_decision ?? null,
  };
}
