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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de Periodo
   * @returns {Period|null} Entidad de dominio Period
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Period (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('planEstudioId' in dataValues && dataValues.planEstudioId !== undefined) {
      specificFields.studyPlanId = dataValues.planEstudioId ?? null;
    }
    if ('nombre' in dataValues && dataValues.nombre !== undefined) {
      specificFields.name = dataValues.nombre;
    }
    if ('numero' in dataValues && dataValues.numero !== undefined) {
      specificFields.number = dataValues.numero;
    }
    if ('ordenVisualizacion' in dataValues && dataValues.ordenVisualizacion !== undefined) {
      specificFields.displayOrder = dataValues.ordenVisualizacion;
    }
    if ('descripcion' in dataValues && dataValues.descripcion !== undefined) {
      specificFields.description = dataValues.descripcion ?? null;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Period(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {Period|Object} entity - Entidad Period o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Period como objeto plano
    const data = entity instanceof Period ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      planEstudioId: data.studyPlanId ?? null,
      nombre: data.name,
      numero: data.number,
      ordenVisualizacion: data.displayOrder !== undefined ? data.displayOrder : 1,
      descripcion: data.description ?? null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Period
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {Period|Object} entity - Entidad Period o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Period como objeto plano
    const data = entity instanceof Period ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Period
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('studyPlanId' in data) {
      updateData.planEstudioId = data.studyPlanId ?? null;
    }
    if ('name' in data) {
      updateData.nombre = data.name;
    }
    if ('number' in data) {
      updateData.numero = data.number;
    }
    if ('displayOrder' in data) {
      updateData.ordenVisualizacion = data.displayOrder;
    }
    if ('description' in data) {
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

