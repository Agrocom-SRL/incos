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
   * 
   * @param {Object|null} model - Modelo Sequelize de ActividadCalendario
   * @returns {CalendarActivity|null} Entidad de dominio CalendarActivity
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de CalendarActivity (campos del dominio)
    const specificFields = {
      academicPeriodId: model.periodoAcademicoId ?? null,
      activityId: model.actividadId ?? null,
      code: model.codigo ?? null,
      customName: model.nombrePersonalizado ?? null,
      careerIds: model.carrerasIds ?? null, // JSON puede venir como objeto o string
      startDate: model.fechaInicio,
      endDate: model.fechaFin ?? null,
      isAllDay: Boolean(model.esTodoElDia),
      schedule: model.horario ?? null, // JSON puede venir como objeto o string
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new CalendarActivity(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {CalendarActivity|Object} entity - Entidad CalendarActivity o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad CalendarActivity como objeto plano
    const data = entity instanceof CalendarActivity ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
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
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de CalendarActivity
   * 
   * @param {CalendarActivity|Object} entity - Entidad CalendarActivity o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad CalendarActivity como objeto plano
    const data = entity instanceof CalendarActivity ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de CalendarActivity
    if (data.academicPeriodId !== undefined) {
      updateData.periodoAcademicoId = data.academicPeriodId ?? null;
    }
    if (data.activityId !== undefined) {
      updateData.actividadId = data.activityId ?? null;
    }
    if (data.code !== undefined) {
      updateData.codigo = data.code ?? null;
    }
    if (data.customName !== undefined) {
      updateData.nombrePersonalizado = data.customName ?? null;
    }
    if (data.careerIds !== undefined) {
      updateData.carrerasIds = data.careerIds ?? null;
    }
    if (data.startDate !== undefined) {
      updateData.fechaInicio = data.startDate;
    }
    if (data.endDate !== undefined) {
      updateData.fechaFin = data.endDate ?? null;
    }
    if (data.isAllDay !== undefined) {
      updateData.esTodoElDia = data.isAllDay;
    }
    if (data.schedule !== undefined) {
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
