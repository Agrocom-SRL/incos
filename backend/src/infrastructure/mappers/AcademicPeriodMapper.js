import { AcademicPeriod } from '../../domain/entities/AcademicPeriod.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: AcademicPeriodMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (AcademicPeriod)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de AcademicPeriod
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de AcademicPeriod
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: AcademicPeriod (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + AcademicPeriodMapper (campos específicos)
 * - Infrastructure Layer: AcademicPeriodRepository (usa el mapper para conversiones)
 */
export class AcademicPeriodMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de AcademicPeriod
   * 
   * @param {Object|null} model - Modelo Sequelize de PeriodoAcademico
   * @returns {AcademicPeriod|null} Entidad de dominio AcademicPeriod
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de AcademicPeriod (campos del dominio)
    const specificFields = {
      managementId: model.gestionId ?? null,
      code: model.codigo ?? null,
      name: model.nombre,
      division: model.division,
      orderNumber: model.numeroOrden ?? null,
      startDate: model.fechaInicio,
      endDate: model.fechaFin,
      colorHex: model.colorHex ?? null,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new AcademicPeriod(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {AcademicPeriod|Object} entity - Entidad AcademicPeriod o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad AcademicPeriod como objeto plano
    const data = entity instanceof AcademicPeriod ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      gestionId: data.managementId ?? null,
      codigo: data.code ?? null,
      nombre: data.name,
      division: data.division,
      numeroOrden: data.orderNumber ?? null,
      fechaInicio: data.startDate,
      fechaFin: data.endDate,
      colorHex: data.colorHex ?? null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de AcademicPeriod
   * 
   * @param {AcademicPeriod|Object} entity - Entidad AcademicPeriod o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad AcademicPeriod como objeto plano
    const data = entity instanceof AcademicPeriod ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de AcademicPeriod
    if (data.managementId !== undefined) {
      updateData.gestionId = data.managementId ?? null;
    }
    if (data.code !== undefined) {
      updateData.codigo = data.code ?? null;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.division !== undefined) {
      updateData.division = data.division;
    }
    if (data.orderNumber !== undefined) {
      updateData.numeroOrden = data.orderNumber ?? null;
    }
    if (data.startDate !== undefined) {
      updateData.fechaInicio = data.startDate;
    }
    if (data.endDate !== undefined) {
      updateData.fechaFin = data.endDate;
    }
    if (data.colorHex !== undefined) {
      updateData.colorHex = data.colorHex ?? null;
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
   * @returns {AcademicPeriod[]} Array de entidades AcademicPeriod
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}
