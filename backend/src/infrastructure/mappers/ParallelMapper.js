import { Parallel } from '../../domain/entities/Parallel.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ParallelMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Parallel)
 */
export class ParallelMapper {
  static toEntity(model) {
    if (!model) return null;

    const specificFields = {
      careerId: model.carreraId,
      periodId: model.periodoId,
      name: model.nombre,
      shift: model.turno,
      description: model.descripcion,
    };

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Parallel(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof Parallel ? entity.toPlainObject() : entity;

    return {
      carreraId: data.careerId || null,
      periodoId: data.periodId || null,
      nombre: data.name,
      turno: data.shift,
      descripcion: data.description || null,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof Parallel ? entity.toPlainObject() : entity;
    const updateData = {};

    if (data.careerId !== undefined) { updateData.carreraId = data.careerId || null; }
    if (data.periodId !== undefined) { updateData.periodoId = data.periodId || null; }
    if (data.name !== undefined) { updateData.nombre = data.name; }
    if (data.shift !== undefined) { updateData.turno = data.shift; }
    if (data.description !== undefined) { updateData.descripcion = data.description || null; }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
