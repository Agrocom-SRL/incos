import { Classroom } from '../../domain/entities/Classroom.js';
import { BaseMapper } from './BaseMapper.js';
import { CATEGORIAS_AULA } from '../../domain/constants/cursos.constants.js';

/**
 * Mapper: ClassroomMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Classroom)
 */
export class ClassroomMapper {
  static toEntity(model) {
    if (!model) return null;

    const specificFields = {
      code: model.codigo,
      name: model.nombre,
      category: model.categoria,
      capacity: model.capacidad,
      observations: model.observaciones,
    };

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Classroom(entityData);
  }

  static toModel(entity) {
    const data = entity instanceof Classroom ? entity.toPlainObject() : entity;

    return {
      codigo: data.code,
      nombre: data.name,
      categoria: data.category || CATEGORIAS_AULA.AULA,
      capacidad: data.capacity !== undefined ? data.capacity : 35,
      observaciones: data.observations || null,
    };
  }

  static toModelForUpdate(entity) {
    const data = entity instanceof Classroom ? entity.toPlainObject() : entity;
    const updateData = {};

    if (data.code !== undefined) { updateData.codigo = data.code; }
    if (data.name !== undefined) { updateData.nombre = data.name; }
    if (data.category !== undefined) { updateData.categoria = data.category; }
    if (data.capacity !== undefined) { updateData.capacidad = data.capacity; }
    if (data.observations !== undefined) { updateData.observaciones = data.observations || null; }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
