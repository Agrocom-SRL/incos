import { BaseMapper } from '../base/index.js';

export function entityToPresentation(asig) {
  if (!asig) return null;
  const presentation = {};
  BaseMapper.mapBaseFields(asig, presentation);
  BaseMapper.mapFieldIfExists(asig, 'studyPlanId', 'plan_estudio_id', presentation);
  BaseMapper.mapFieldIfExists(asig, 'periodId', 'periodo_id', presentation);
  BaseMapper.mapFieldIfExists(asig, 'subjectId', 'materia_id', presentation);
  BaseMapper.mapFieldIfExists(asig, 'weeklyHours', 'horas_semanales', presentation);
  BaseMapper.mapFieldIfExists(asig, 'credits', 'creditos', presentation);
  BaseMapper.mapFieldIfExists(asig, 'modality', 'modalidad', presentation);
  BaseMapper.mapFieldIfExists(asig, 'displayOrder', 'orden_visualizacion', presentation);
  return presentation;
}

export function entitiesToPresentation(asigs) {
  if (!Array.isArray(asigs)) return [];
  return asigs.map(entityToPresentation);
}

export class PlanSubjectMapper {
  static entityToPresentation(asig) {
    return entityToPresentation(asig);
  }
  static entitiesToPresentation(asigs) {
    return entitiesToPresentation(asigs);
  }
}
