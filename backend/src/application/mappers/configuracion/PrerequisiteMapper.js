import { BaseMapper } from '../base/index.js';

export function entityToPresentation(pre) {
  if (!pre) return null;
  const presentation = {};
  BaseMapper.mapBaseFields(pre, presentation);
  BaseMapper.mapFieldIfExists(pre, 'studyPlanId', 'plan_estudio_id', presentation);
  BaseMapper.mapFieldIfExists(pre, 'subjectId', 'asignatura_id', presentation);
  BaseMapper.mapFieldIfExists(pre, 'prerequisiteId', 'prerrequisito_id', presentation);
  return presentation;
}

export function entitiesToPresentation(items) {
  if (!Array.isArray(items)) return [];
  return items.map(entityToPresentation);
}

export class PrerequisiteMapper {
  static entityToPresentation(pre) {
    return entityToPresentation(pre);
  }
  static entitiesToPresentation(items) {
    return entitiesToPresentation(items);
  }
}
