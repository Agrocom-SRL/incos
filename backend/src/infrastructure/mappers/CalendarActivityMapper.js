import { CalendarActivity } from '../../domain/entities/CalendarActivity.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: CalendarActivityMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (CalendarActivity)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de CalendarActivity
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de CalendarActivity
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: CalendarActivity (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + CalendarActivityMapper (campos específicos)
 * - Infrastructure Layer: CalendarActivityRepository (usa el mapper para conversiones)
 */
export class CalendarActivityMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de CalendarActivity
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de ActividadCalendario
   * @returns {CalendarActivity|null} Entidad de dominio CalendarActivity
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de CalendarActivity (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('periodoAcademicoId' in dataValues && dataValues.periodoAcademicoId !== undefined) {
      specificFields.academicPeriodId = dataValues.periodoAcademicoId ?? null;
    }
    if ('actividadId' in dataValues && dataValues.actividadId !== undefined) {
      specificFields.activityId = dataValues.actividadId ?? null;
    }
    if ('codigo' in dataValues && dataValues.codigo !== undefined) {
      specificFields.code = dataValues.codigo ?? null;
    }
    if ('nombrePersonalizado' in dataValues && dataValues.nombrePersonalizado !== undefined) {
      specificFields.customName = dataValues.nombrePersonalizado ?? null;
    }
    if ('carrerasIds' in dataValues && dataValues.carrerasIds !== undefined) {
      specificFields.careerIds = dataValues.carrerasIds ?? null; // JSON puede venir como objeto o string
    }
    if ('fechaInicio' in dataValues && dataValues.fechaInicio !== undefined) {
      specificFields.startDate = dataValues.fechaInicio;
    }
    if ('fechaFin' in dataValues && dataValues.fechaFin !== undefined) {
      specificFields.endDate = dataValues.fechaFin ?? null;
    }
    if ('esTodoElDia' in dataValues && dataValues.esTodoElDia !== undefined) {
      specificFields.isAllDay = Boolean(dataValues.esTodoElDia);
    }
    if ('horario' in dataValues && dataValues.horario !== undefined) {
      specificFields.schedule = dataValues.horario ?? null; // JSON puede venir como objeto o string
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new CalendarActivity(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {CalendarActivity|Object} entity - Entidad CalendarActivity o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad CalendarActivity como objeto plano
    const data = entity instanceof CalendarActivity ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      periodoAcademicoId: data.academicPeriodId ?? null,
      actividadId: data.activityId ?? null,
      codigo: data.code ?? null,
      nombrePersonalizado: data.customName ?? null,
      carrerasIds: data.careerIds ?? null, // Sequelize manejará la conversión a JSON
      fechaInicio: data.startDate,
      fechaFin: data.endDate ?? null,
      esTodoElDia: data.isAllDay !== undefined ? data.isAllDay : true,
      horario: data.schedule ?? null, // Sequelize manejará la conversión a JSON
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de CalendarActivity
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {CalendarActivity|Object} entity - Entidad CalendarActivity o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad CalendarActivity como objeto plano
    const data = entity instanceof CalendarActivity ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de CalendarActivity
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('academicPeriodId' in data) {
      updateData.periodoAcademicoId = data.academicPeriodId ?? null;
    }
    if ('activityId' in data) {
      updateData.actividadId = data.activityId ?? null;
    }
    if ('code' in data) {
      updateData.codigo = data.code ?? null;
    }
    if ('customName' in data) {
      updateData.nombrePersonalizado = data.customName ?? null;
    }
    if ('careerIds' in data) {
      updateData.carrerasIds = data.careerIds ?? null;
    }
    if ('startDate' in data) {
      updateData.fechaInicio = data.startDate;
    }
    if ('endDate' in data) {
      updateData.fechaFin = data.endDate ?? null;
    }
    if ('isAllDay' in data) {
      updateData.esTodoElDia = data.isAllDay;
    }
    if ('schedule' in data) {
      updateData.horario = data.schedule ?? null;
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
   * @returns {CalendarActivity[]} Array de entidades CalendarActivity
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
