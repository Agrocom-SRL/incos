/**
 * Presentación de un bloque (asignacion_horarios).
 */
export class AsignacionHorarioPresentationMapper {
  static toPresentation(entity) {
    if (!entity) return null;
    return {
      id: entity.id,
      asignacion_docente_id: entity.teacherAssignmentId,
      horario_id: entity.scheduleId,
      orden_secuencia: entity.sequenceOrder ?? 1,
    };
  }
}
