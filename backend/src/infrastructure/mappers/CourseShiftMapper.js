import { CourseShift } from '../../domain/entities/CourseShift.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: CourseShiftMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (CourseShift)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de CourseShift
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de CourseShift
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: CourseShift (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + CourseShiftMapper (campos específicos)
 * - Infrastructure Layer: CourseShiftRepository (usa el mapper para conversiones)
 */
export class CourseShiftMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de CourseShift
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de TurnoCurso
   * @returns {CourseShift|null} Entidad de dominio CourseShift
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de CourseShift (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('asignacionId' in dataValues && dataValues.asignacionId !== undefined) {
      specificFields.assignmentId = dataValues.asignacionId;
    }
    if ('turnoId' in dataValues && dataValues.turnoId !== undefined) {
      specificFields.shiftId = dataValues.turnoId;
    }
    if ('diaSemana' in dataValues && dataValues.diaSemana !== undefined) {
      specificFields.weekDay = dataValues.diaSemana;
    }
    if ('horaInicio' in dataValues && dataValues.horaInicio !== undefined) {
      specificFields.startTime = dataValues.horaInicio;
    }
    if ('horaFin' in dataValues && dataValues.horaFin !== undefined) {
      specificFields.endTime = dataValues.horaFin;
    }
    if ('aula' in dataValues && dataValues.aula !== undefined) {
      specificFields.classroom = dataValues.aula;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new CourseShift(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {CourseShift|Object} entity - Entidad CourseShift o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad CourseShift como objeto plano
    const data = entity instanceof CourseShift ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      asignacionId: data.assignmentId || null,
      turnoId: data.shiftId || null,
      diaSemana: data.weekDay,
      horaInicio: data.startTime,
      horaFin: data.endTime,
      aula: data.classroom,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de CourseShift
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {CourseShift|Object} entity - Entidad CourseShift o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad CourseShift como objeto plano
    const data = entity instanceof CourseShift ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de CourseShift
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('assignmentId' in data) {
      updateData.asignacionId = data.assignmentId || null;
    }
    if ('shiftId' in data) {
      updateData.turnoId = data.shiftId || null;
    }
    if ('weekDay' in data) {
      updateData.diaSemana = data.weekDay;
    }
    if ('startTime' in data) {
      updateData.horaInicio = data.startTime;
    }
    if ('endTime' in data) {
      updateData.horaFin = data.endTime;
    }
    if ('classroom' in data) {
      updateData.aula = data.classroom;
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
   * @returns {CourseShift[]} Array de entidades CourseShift
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

