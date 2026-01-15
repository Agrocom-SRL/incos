import { Parallel } from '../../domain/entities/Parallel.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ParallelMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Parallel)
 */
export class ParallelMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * @param {Object|null} model - Modelo Sequelize de Paralelo
   * @returns {Parallel|null} Entidad de dominio Parallel
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Parallel (campos del dominio)
    // Solo incluir campos que existen en el modelo (no undefined)
    const specificFields = {};
    if (model.carreraId !== undefined) {
      specificFields.careerId = model.carreraId;
    }
    if (model.periodoId !== undefined) {
      specificFields.periodId = model.periodoId;
    }
    if (model.nombre !== undefined) {
      specificFields.name = model.nombre;
    }
    if (model.turno !== undefined) {
      specificFields.shift = model.turno;
    }
    if (model.descripcion !== undefined) {
      specificFields.description = model.descripcion;
    }

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
