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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de Curso
   * @returns {Course|null} Entidad de dominio Course
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Course (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('codigo' in dataValues && dataValues.codigo !== undefined) {
      specificFields.code = dataValues.codigo;
    }
    if ('paraleloId' in dataValues && dataValues.paraleloId !== undefined) {
      specificFields.parallelId = dataValues.paraleloId;
    }
    if ('asignaturaPlanId' in dataValues && dataValues.asignaturaPlanId !== undefined) {
      specificFields.planSubjectId = dataValues.asignaturaPlanId;
    }
    if ('cupoMaximo' in dataValues && dataValues.cupoMaximo !== undefined) {
      specificFields.maxCapacity = dataValues.cupoMaximo;
    }
    if ('cupoMinimo' in dataValues && dataValues.cupoMinimo !== undefined) {
      specificFields.minCapacity = dataValues.cupoMinimo;
    }
    if ('colorHex' in dataValues && dataValues.colorHex !== undefined) {
      specificFields.colorHex = dataValues.colorHex;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Course(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {Course|Object} entity - Entidad Course o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Course como objeto plano
    const data = entity instanceof Course ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    const row = {
      codigo: data.code,
      paraleloId: data.parallelId || null,
      asignaturaPlanId: data.planSubjectId || null,
      cupoMaximo: data.maxCapacity !== undefined ? data.maxCapacity : 35,
      cupoMinimo: data.minCapacity !== undefined ? data.minCapacity : 10,
    };
    if (data.colorHex != null && String(data.colorHex).trim() !== '') {
      row.colorHex = String(data.colorHex).trim();
    }
    return row;
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Course
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {Course|Object} entity - Entidad Course o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Course como objeto plano
    const data = entity instanceof Course ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Course
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('code' in data) {
      updateData.codigo = data.code;
    }
    if ('parallelId' in data) {
      updateData.paraleloId = data.parallelId || null;
    }
    if ('planSubjectId' in data) {
      updateData.asignaturaPlanId = data.planSubjectId || null;
    }
    if ('maxCapacity' in data) {
      updateData.cupoMaximo = data.maxCapacity;
    }
    if ('minCapacity' in data) {
      updateData.cupoMinimo = data.minCapacity;
    }
    if ('colorHex' in data) {
      updateData.colorHex = data.colorHex || null;
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

