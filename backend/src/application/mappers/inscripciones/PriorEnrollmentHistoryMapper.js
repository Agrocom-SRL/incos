/**
 * Mapper: PriorEnrollmentHistory → presentación API
 */

import { BaseMapper } from '../base/index.js';

export function entityToPresentation(row, extra = {}) {
  if (!row) return null;
  const plain = row.toPlainObject ? row.toPlainObject() : row;
  const presentation = {};
  BaseMapper.mapBaseFields(plain, presentation);
  BaseMapper.mapFieldIfExists(plain, 'enrollmentId', 'inscripcionId', presentation);
  BaseMapper.mapFieldIfExists(plain, 'curriculumSubjectId', 'asignaturaPlanId', presentation);
  BaseMapper.mapFieldIfExists(plain, 'finalGrade', 'notaFinal', presentation);
  BaseMapper.mapFieldIfExists(plain, 'status', 'estado', presentation);
  return { ...presentation, ...extra };
}

export function entitiesToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => entityToPresentation(r));
}

export class PriorEnrollmentHistoryMapper {
  static entityToPresentation(row, extra) {
    return entityToPresentation(row, extra);
  }

  static entitiesToPresentation(rows) {
    return entitiesToPresentation(rows);
  }
}
