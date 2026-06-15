/**
 * Mapper de presentación — listado de asignaciones docente (curso + plan habilitado + docente).
 * Expone claves en español alineadas al dominio de negocio y al front.
 */

import { TeacherAssignment } from '../../../domain/entities/TeacherAssignment.js';

function toPlain(entity) {
  if (!entity) return null;
  return entity instanceof TeacherAssignment ? entity.toPlainObject() : { ...entity };
}

function toPresentationOne(entity) {
  const a = toPlain(entity);
  if (!a) return null;

  // En la entidad, `active` proviene del campo BD `vigente` (asignación vigente); el listado solo trae filas `activo`=true salvo includeInactive.
  return {
    id: a.id,
    gestionPlanId: a.managementPlanId ?? null,
    ofertaCursoId: a.offerCourseId ?? null,
    cursoId: a.courseId ?? null,
    docenteId: a.teacherId ?? null,
    cargaHoraria: a.hours ?? null,
    vigente: a.active !== undefined ? a.active : null,
    motivo: a.reason ?? null,
    fechaAsignacion: a.assignmentDate ?? null,
    createdAt: a.createdAt ?? null,
    updatedAt: a.updatedAt ?? null,
  };
}

export function entitiesToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(toPresentationOne).filter(Boolean);
}

export class TeacherAssignmentListMapper {
  static entitiesToPresentation(rows) {
    return entitiesToPresentation(rows);
  }

  /** Una fila (p. ej. respuesta POST). */
  static entityToPresentation(entity) {
    return toPresentationOne(entity);
  }
}
