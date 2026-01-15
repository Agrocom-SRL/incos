import { Schedule } from '../../domain/entities/Schedule.js';
import { BaseMapper } from './BaseMapper.js';
import { TIPOS_HORARIO } from '../../domain/constants/cursos.constants.js';

/**
 * Mapper: ScheduleMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Schedule)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Schedule
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Schedule
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Schedule (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + ScheduleMapper (campos específicos)
 * - Infrastructure Layer: ScheduleRepository (usa el mapper para conversiones)
 */
export class ScheduleMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Schedule
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de Horario
   * @returns {Schedule|null} Entidad de dominio Schedule
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Schedule (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('nombre' in dataValues && dataValues.nombre !== undefined) {
      specificFields.name = dataValues.nombre;
    }
    if ('dia' in dataValues && dataValues.dia !== undefined) {
      specificFields.day = dataValues.dia;
    }
    if ('horaInicio' in dataValues && dataValues.horaInicio !== undefined) {
      specificFields.startTime = dataValues.horaInicio;
    }
    if ('horaFin' in dataValues && dataValues.horaFin !== undefined) {
      specificFields.endTime = dataValues.horaFin;
    }
    if ('turno' in dataValues && dataValues.turno !== undefined) {
      specificFields.shift = dataValues.turno;
    }
    if ('numeroBloque' in dataValues && dataValues.numeroBloque !== undefined) {
      specificFields.blockNumber = dataValues.numeroBloque;
    }
    if ('tipoHorario' in dataValues && dataValues.tipoHorario !== undefined) {
      specificFields.scheduleType = dataValues.tipoHorario;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Schedule(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {Schedule|Object} entity - Entidad Schedule o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Schedule como objeto plano
    const data = entity instanceof Schedule ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      nombre: data.name || null,
      dia: data.day || null,
      horaInicio: data.startTime || null,
      horaFin: data.endTime || null,
      turno: data.shift || null,
      numeroBloque: data.blockNumber || null,
      tipoHorario: data.scheduleType || TIPOS_HORARIO.CLASES,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Schedule
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {Schedule|Object} entity - Entidad Schedule o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Schedule como objeto plano
    const data = entity instanceof Schedule ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Schedule
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('name' in data) { updateData.nombre = data.name || null; }
    if ('day' in data) { updateData.dia = data.day || null; }
    if ('startTime' in data) { updateData.horaInicio = data.startTime || null; }
    if ('endTime' in data) { updateData.horaFin = data.endTime || null; }
    if ('shift' in data) { updateData.turno = data.shift || null; }
    if ('blockNumber' in data) { updateData.numeroBloque = data.blockNumber || null; }
    if ('scheduleType' in data) { updateData.tipoHorario = data.scheduleType; }

    // Campos base (active/activo)
    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * Convierte un array de modelos Sequelize a array de entidades de dominio
   * 
   * @param {Array} models - Array de modelos Sequelize
   * @returns {Schedule[]} Array de entidades Schedule
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
