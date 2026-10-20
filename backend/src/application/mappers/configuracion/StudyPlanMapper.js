import { BaseMapper } from '../base/index.js';

export function entityToPresentation(plan) {
  if (!plan) return null;
  const presentation = {};
  BaseMapper.mapBaseFields(plan, presentation);
  BaseMapper.mapFieldIfExists(plan, 'careerId', 'carrera_id', presentation);
  BaseMapper.mapFieldIfExists(plan, 'planName', 'nombre_plan', presentation);
  BaseMapper.mapFieldIfExists(plan, 'ministerialResolution', 'resolucion_ministerial', presentation);
  BaseMapper.mapFieldIfExists(plan, 'documentPath', 'documento_ruta', presentation);
  BaseMapper.mapFieldIfExists(plan, 'durationYears', 'duracion_anios', presentation);
  BaseMapper.mapFieldIfExists(plan, 'totalHours', 'carga_horaria_total', presentation);
  BaseMapper.mapFieldIfExists(plan, 'hoursPerWeek', 'horas_semana', presentation);
  BaseMapper.mapFieldIfExists(plan, 'hoursPerMonth', 'horas_mes', presentation);
  BaseMapper.mapFieldIfExists(plan, 'hoursPerYear', 'horas_anio', presentation);
  BaseMapper.mapFieldIfExists(plan, 'observations', 'observaciones', presentation);
  BaseMapper.mapFieldIfExists(plan, 'isActive', 'vigente', presentation);
  return presentation;
}

export function entitiesToPresentation(plans) {
  if (!Array.isArray(plans)) return [];
  return plans.map(entityToPresentation);
}

export class StudyPlanMapper {
  static entityToPresentation(plan) {
    return entityToPresentation(plan);
  }
  static entitiesToPresentation(plans) {
    return entitiesToPresentation(plans);
  }
}
