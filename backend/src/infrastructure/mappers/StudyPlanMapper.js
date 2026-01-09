import { StudyPlan } from '../../domain/entities/StudyPlan.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: StudyPlanMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (StudyPlan)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de StudyPlan
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de StudyPlan
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: StudyPlan (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + StudyPlanMapper (campos específicos)
 * - Infrastructure Layer: StudyPlanRepository (usa el mapper para conversiones)
 */
export class StudyPlanMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudyPlan
   * 
   * @param {Object|null} model - Modelo Sequelize de PlanEstudios
   * @returns {StudyPlan|null} Entidad de dominio StudyPlan
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de StudyPlan (campos del dominio)
    const specificFields = {
      careerId: model.carreraId ?? null,
      planName: model.nombrePlan,
      ministerialResolution: model.resolucionMinisterial ?? null,
      documentPath: model.documentoRuta ?? null,
      durationYears: model.duracionAnios,
      totalHours: model.cargaHorariaTotal,
      hoursPerWeek: model.horasSemana,
      hoursPerMonth: model.horasMes,
      hoursPerYear: model.horasAnio,
      observations: model.observaciones ?? null,
      isActive: Boolean(model.vigente),
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new StudyPlan(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {StudyPlan|Object} entity - Entidad StudyPlan o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad StudyPlan como objeto plano
    const data = entity instanceof StudyPlan ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      carreraId: data.careerId ?? null,
      nombrePlan: data.planName,
      resolucionMinisterial: data.ministerialResolution ?? null,
      documentoRuta: data.documentPath ?? null,
      duracionAnios: data.durationYears,
      cargaHorariaTotal: data.totalHours,
      horasSemana: data.hoursPerWeek,
      horasMes: data.hoursPerMonth,
      horasAnio: data.hoursPerYear,
      observaciones: data.observations ?? null,
      vigente: data.isActive !== undefined ? data.isActive : false,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de StudyPlan
   * 
   * @param {StudyPlan|Object} entity - Entidad StudyPlan o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad StudyPlan como objeto plano
    const data = entity instanceof StudyPlan ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de StudyPlan
    if (data.careerId !== undefined) {
      updateData.carreraId = data.careerId ?? null;
    }
    if (data.planName !== undefined) {
      updateData.nombrePlan = data.planName;
    }
    if (data.ministerialResolution !== undefined) {
      updateData.resolucionMinisterial = data.ministerialResolution ?? null;
    }
    if (data.documentPath !== undefined) {
      updateData.documentoRuta = data.documentPath ?? null;
    }
    if (data.durationYears !== undefined) {
      updateData.duracionAnios = data.durationYears;
    }
    if (data.totalHours !== undefined) {
      updateData.cargaHorariaTotal = data.totalHours;
    }
    if (data.hoursPerWeek !== undefined) {
      updateData.horasSemana = data.hoursPerWeek;
    }
    if (data.hoursPerMonth !== undefined) {
      updateData.horasMes = data.hoursPerMonth;
    }
    if (data.hoursPerYear !== undefined) {
      updateData.horasAnio = data.hoursPerYear;
    }
    if (data.observations !== undefined) {
      updateData.observaciones = data.observations ?? null;
    }
    if (data.isActive !== undefined) {
      updateData.vigente = data.isActive;
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
   * @returns {StudyPlan[]} Array de entidades StudyPlan
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

