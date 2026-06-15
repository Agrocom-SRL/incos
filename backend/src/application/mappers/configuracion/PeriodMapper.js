import { BaseMapper } from '../base/index.js';

export function entityToPresentation(period) {
  if (!period) return null;
  const presentation = {};
  BaseMapper.mapBaseFields(period, presentation);
  BaseMapper.mapFieldIfExists(period, 'studyPlanId', 'plan_estudio_id', presentation);
  BaseMapper.mapFieldIfExists(period, 'name', 'nombre', presentation);
  BaseMapper.mapFieldIfExists(period, 'number', 'numero', presentation);
  BaseMapper.mapFieldIfExists(period, 'displayOrder', 'orden_visualizacion', presentation);
  BaseMapper.mapFieldIfExists(period, 'description', 'descripcion', presentation);
  return presentation;
}

export function entitiesToPresentation(periods) {
  if (!Array.isArray(periods)) return [];
  return periods.map(entityToPresentation);
}

export class PeriodMapper {
  static entityToPresentation(period) {
    return entityToPresentation(period);
  }
  static entitiesToPresentation(periods) {
    return entitiesToPresentation(periods);
  }
}

