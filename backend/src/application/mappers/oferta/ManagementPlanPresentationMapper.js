import { BaseMapper } from '../base/index.js';

export function entityToPresentation(entity) {
  if (!entity) return null;
  const p = {};
  BaseMapper.mapBaseFields(entity, p);
  BaseMapper.mapFieldIfExists(entity, 'managementId', 'gestionId', p);
  BaseMapper.mapFieldIfExists(entity, 'studyPlanId', 'planEstudioId', p);
  BaseMapper.mapFieldIfExists(entity, 'name', 'nombre', p);
  BaseMapper.mapFieldIfExists(entity, 'state', 'estado', p);
  BaseMapper.mapFieldIfExists(entity, 'cancellationReason', 'motivoCancelacion', p);
  return p;
}

export function entitiesToPresentation(entities) {
  return (entities || []).map(entityToPresentation).filter(Boolean);
}
