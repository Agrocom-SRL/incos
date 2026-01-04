import { Period } from '../../domain/entities/Period.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: PeriodMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Period)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Period
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Period
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Period (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + PeriodMapper (campos específicos)
 * - Infrastructure Layer: PeriodRepository (usa el mapper para conversiones)
 */
export class PeriodMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Period
   * 
   * @param {Object|null} model - Modelo Sequelize de Periodo
   * @returns {Period|null} Entidad de dominio Period
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Period (campos del dominio)
    const specificFields = {
      careerId: model.carreraId,
      name: model.nombre,
      number: model.numero,
      displayOrder: model.ordenVisualizacion,
      description: model.descripcion,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Period(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Period|Object} entity - Entidad Period o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Period como objeto plano
    const data = entity instanceof Period ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      carreraId: data.careerId || null,
      nombre: data.name,
      numero: data.number,
      ordenVisualizacion: data.displayOrder !== undefined ? data.displayOrder : 1,
      descripcion: data.description || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Period
   * 
   * @param {Period|Object} entity - Entidad Period o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Period como objeto plano
    const data = entity instanceof Period ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Period
    if (data.careerId !== undefined) {
      updateData.carreraId = data.careerId || null;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.number !== undefined) {
      updateData.numero = data.number;
    }
    if (data.displayOrder !== undefined) {
      updateData.ordenVisualizacion = data.displayOrder;
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
   * @returns {Period[]} Array de entidades Period
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

