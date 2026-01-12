import { Course } from '../../domain/entities/Course.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: CourseMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Course)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Course
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Course
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Course (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + CourseMapper (campos específicos)
 * - Infrastructure Layer: CourseRepository (usa el mapper para conversiones)
 */
export class CourseMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Course
   * 
   * @param {Object|null} model - Modelo Sequelize de Curso
   * @returns {Course|null} Entidad de dominio Course
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Course (campos del dominio)
    const specificFields = {
      code: model.codigo,
      parallelId: model.paraleloId,
      planSubjectId: model.asignaturaPlanId,
      maxCapacity: model.cupoMaximo,
      minCapacity: model.cupoMinimo,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Course(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Course|Object} entity - Entidad Course o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Course como objeto plano
    const data = entity instanceof Course ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      codigo: data.code,
      paraleloId: data.parallelId || null,
      asignaturaPlanId: data.planSubjectId || null,
      cupoMaximo: data.maxCapacity !== undefined ? data.maxCapacity : 35,
      cupoMinimo: data.minCapacity !== undefined ? data.minCapacity : 10,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Course
   * 
   * @param {Course|Object} entity - Entidad Course o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Course como objeto plano
    const data = entity instanceof Course ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Course
    if (data.code !== undefined) {
      updateData.codigo = data.code;
    }
    if (data.parallelId !== undefined) {
      updateData.paraleloId = data.parallelId || null;
    }
    if (data.planSubjectId !== undefined) {
      updateData.asignaturaPlanId = data.planSubjectId || null;
    }
    if (data.maxCapacity !== undefined) {
      updateData.cupoMaximo = data.maxCapacity;
    }
    if (data.minCapacity !== undefined) {
      updateData.cupoMinimo = data.minCapacity;
    }

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   * 
   * @param {Array} models - Array de modelos Sequelize
   * @returns {Course[]} Array de entidades Course
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

