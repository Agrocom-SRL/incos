import { CourseSchedule } from '../../domain/entities/CourseSchedule.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: CourseScheduleMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (CourseSchedule)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de CourseSchedule
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de CourseSchedule
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: CourseSchedule (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + CourseScheduleMapper (campos específicos)
 * - Infrastructure Layer: CourseScheduleRepository (usa el mapper para conversiones)
 */
export class CourseScheduleMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de CourseSchedule
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de HorarioCurso
   * @returns {CourseSchedule|null} Entidad de dominio CourseSchedule
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de CourseSchedule (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('cursoId' in dataValues && dataValues.cursoId !== undefined) {
      specificFields.courseId = dataValues.cursoId;
    }
    if ('horarioId' in dataValues && dataValues.horarioId !== undefined) {
      specificFields.scheduleId = dataValues.horarioId;
    }
    if ('aulaId' in dataValues && dataValues.aulaId !== undefined) {
      specificFields.classroomId = dataValues.aulaId;
    }
    if ('ordenSecuencia' in dataValues && dataValues.ordenSecuencia !== undefined) {
      specificFields.sequenceOrder = dataValues.ordenSecuencia;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new CourseSchedule(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {CourseSchedule|Object} entity - Entidad CourseSchedule o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad CourseSchedule como objeto plano
    const data = entity instanceof CourseSchedule ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      cursoId: data.courseId || null,
      horarioId: data.scheduleId || null,
      aulaId: data.classroomId || null,
      ordenSecuencia: data.sequenceOrder !== undefined ? data.sequenceOrder : 1,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de CourseSchedule
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {CourseSchedule|Object} entity - Entidad CourseSchedule o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad CourseSchedule como objeto plano
    const data = entity instanceof CourseSchedule ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de CourseSchedule
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('courseId' in data) {
      updateData.cursoId = data.courseId || null;
    }
    if ('scheduleId' in data) {
      updateData.horarioId = data.scheduleId || null;
    }
    if ('classroomId' in data) {
      updateData.aulaId = data.classroomId || null;
    }
    if ('sequenceOrder' in data) {
      updateData.ordenSecuencia = data.sequenceOrder;
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
   * @returns {CourseSchedule[]} Array de entidades CourseSchedule
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
