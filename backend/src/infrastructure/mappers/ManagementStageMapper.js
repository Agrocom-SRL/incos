import { ManagementStage } from '../../domain/entities/ManagementStage.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ManagementStageMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (ManagementStage)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de ManagementStage
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de ManagementStage
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: ManagementStage (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + ManagementStageMapper (campos específicos)
 * - Infrastructure Layer: ManagementStageRepository (usa el mapper para conversiones)
 */
export class ManagementStageMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de ManagementStage
   * 
   * @param {Object|null} model - Modelo Sequelize de EtapaGestion
   * @returns {ManagementStage|null} Entidad de dominio ManagementStage
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de ManagementStage (campos del dominio)
    const specificFields = {
      managementId: model.gestionId,
      name: model.nombre,
      type: model.tipo,
      startDate: model.fechaInicio,
      endDate: model.fechaFin,
      isActive: model.vigente === 1 || model.vigente === true,
      description: model.descripcion,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new ManagementStage(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {ManagementStage|Object} entity - Entidad ManagementStage o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad ManagementStage como objeto plano
    const data = entity instanceof ManagementStage ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      gestionId: data.managementId || null,
      nombre: data.name,
      tipo: data.type,
      fechaInicio: data.startDate,
      fechaFin: data.endDate || null,
      vigente: data.isActive !== undefined ? data.isActive : false,
      descripcion: data.description || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de ManagementStage
   * 
   * @param {ManagementStage|Object} entity - Entidad ManagementStage o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad ManagementStage como objeto plano
    const data = entity instanceof ManagementStage ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de ManagementStage
    if (data.managementId !== undefined) {
      updateData.gestionId = data.managementId || null;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.type !== undefined) {
      updateData.tipo = data.type;
    }
    if (data.startDate !== undefined) {
      updateData.fechaInicio = data.startDate;
    }
    if (data.endDate !== undefined) {
      updateData.fechaFin = data.endDate || null;
    }
    if (data.isActive !== undefined) {
      updateData.vigente = data.isActive;
    }
    if (data.description !== undefined) {
      updateData.descripcion = data.description || null;
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
   * @returns {ManagementStage[]} Array de entidades ManagementStage
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

