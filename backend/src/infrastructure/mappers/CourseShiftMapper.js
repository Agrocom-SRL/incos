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
   * 
   * @param {Object|null} model - Modelo Sequelize de TurnoCurso
   * @returns {CourseShift|null} Entidad de dominio CourseShift
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de CourseShift (campos del dominio)
    const specificFields = {
      assignmentId: model.asignacionId,
      shiftId: model.turnoId,
      weekDay: model.diaSemana,
      startTime: model.horaInicio,
      endTime: model.horaFin,
      classroom: model.aula,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new CourseShift(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {CourseShift|Object} entity - Entidad CourseShift o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad CourseShift como objeto plano
    const data = entity instanceof CourseShift ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
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
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de CourseShift
   * 
   * @param {CourseShift|Object} entity - Entidad CourseShift o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad CourseShift como objeto plano
    const data = entity instanceof CourseShift ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de CourseShift
    if (data.assignmentId !== undefined) {
      updateData.asignacionId = data.assignmentId || null;
    }
    if (data.shiftId !== undefined) {
      updateData.turnoId = data.shiftId || null;
    }
    if (data.weekDay !== undefined) {
      updateData.diaSemana = data.weekDay;
    }
    if (data.startTime !== undefined) {
      updateData.horaInicio = data.startTime;
    }
    if (data.endTime !== undefined) {
      updateData.horaFin = data.endTime;
    }
    if (data.classroom !== undefined) {
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

