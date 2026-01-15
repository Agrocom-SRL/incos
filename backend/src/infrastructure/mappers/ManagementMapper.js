import { Management } from '../../domain/entities/Management.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: ManagementMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Management)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Management
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Management
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Management (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + ManagementMapper (campos específicos)
 * - Infrastructure Layer: ManagementRepository (usa el mapper para conversiones)
 */
export class ManagementMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Management
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * @param {Object|null} model - Modelo Sequelize de Gestion
   * @returns {Management|null} Entidad de dominio Management
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Management (campos del dominio)
    // Solo incluir campos que existen en el modelo (no undefined)
    const specificFields = {};
    if (model.codigo !== undefined) {
      specificFields.code = model.codigo;
    }
    if (model.nombre !== undefined) {
      specificFields.name = model.nombre;
    }
    if (model.anio !== undefined) {
      specificFields.year = model.anio;
    }
    if (model.tipo !== undefined) {
      specificFields.type = model.tipo;
    }
    if (model.fechaInicio !== undefined) {
      specificFields.startDate = model.fechaInicio;
    }
    if (model.fechaFin !== undefined) {
      specificFields.endDate = model.fechaFin;
    }
    if (model.vigente !== undefined) {
      specificFields.isActive = model.vigente === true || model.vigente === 1;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Management(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Management|Object} entity - Entidad Management o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Management como objeto plano
    const data = entity instanceof Management ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      codigo: data.code,
      nombre: data.name,
      anio: data.year,
      tipo: data.type,
      fechaInicio: data.startDate,
      fechaFin: data.endDate,
      vigente: data.isActive !== undefined ? data.isActive : false,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Management
   * 
   * @param {Management|Object} entity - Entidad Management o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Management como objeto plano
    const data = entity instanceof Management ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Management
    if (data.code !== undefined) {
      updateData.codigo = data.code;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.year !== undefined) {
      updateData.anio = data.year;
    }
    if (data.type !== undefined) {
      updateData.tipo = data.type;
    }
    if (data.startDate !== undefined) {
      updateData.fechaInicio = data.startDate;
    }
    if (data.endDate !== undefined) {
      updateData.fechaFin = data.endDate;
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
   * @returns {Management[]} Array de entidades Management
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

