/**
 * Mapper de presentación para listados de docentes (Application Layer).
 * Convierte entidades Teacher a objetos planos enriquecidos para la API.
 */

import { Teacher } from '../../../domain/entities/Teacher.js';

function toPlain(teacher) {
  if (!teacher) return null;
  return teacher instanceof Teacher ? teacher.toPlainObject() : { ...teacher };
}

function toPresentationOne(teacher) {
  const t = toPlain(teacher);
  if (!t) return null;

  const nombreCompleto = [t.firstName, t.lastName, t.motherLastName].filter(Boolean).join(' ').trim() || null;
  const ciCompleto = [t.ci, t.expedition].filter(Boolean).join(' ').trim() || null;

  return {
    ...t,
    nombreCompleto,
    ciCompleto,
  };
}

export function entitiesToPresentation(teachers) {
  if (!Array.isArray(teachers)) return [];
  return teachers.map(toPresentationOne).filter(Boolean);
}

export class TeacherListMapper {
  static entitiesToPresentation(teachers) {
    return entitiesToPresentation(teachers);
  }
}
