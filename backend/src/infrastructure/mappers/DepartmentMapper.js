import { Department } from '../../domain/entities/Department.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: DepartmentMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Department)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Department
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Department
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Department (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + DepartmentMapper (campos específicos)
 * - Infrastructure Layer: DepartmentRepository (usa el mapper para conversiones)
 */
export class DepartmentMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Department
   * 
   * @param {Object|null} model - Modelo Sequelize de Departamento
   * @returns {Department|null} Entidad de dominio Department
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Department (campos del dominio)
    const specificFields = {
      countryId: model.paisId,
      name: model.nombre,
      code: model.codigo,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Department(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Department|Object} entity - Entidad Department o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Department como objeto plano
    const data = entity instanceof Department ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      paisId: data.countryId,
      nombre: data.name,
      codigo: data.code ? data.code.toUpperCase() : null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Department
   * 
   * @param {Department|Object} entity - Entidad Department o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Department como objeto plano
    const data = entity instanceof Department ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Department
    if (data.countryId !== undefined) {
      updateData.paisId = data.countryId;
    }
    if (data.name !== undefined) {
      updateData.nombre = data.name;
    }
    if (data.code !== undefined) {
      updateData.codigo = data.code ? data.code.toUpperCase() : null;
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
   * @returns {Department[]} Array de entidades Department
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

