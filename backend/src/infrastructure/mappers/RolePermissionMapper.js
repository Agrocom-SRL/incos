import { RolePermission } from '../../domain/entities/RolePermission.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: RolePermissionMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (RolePermission)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de RolePermission
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de RolePermission
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: RolePermission (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + RolePermissionMapper (campos específicos)
 * - Infrastructure Layer: RolePermissionRepository (usa el mapper para conversiones)
 */
export class RolePermissionMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de RolePermission
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de RolPermiso
   * @returns {RolePermission|null} Entidad de dominio RolePermission
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de RolePermission (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('rolId' in dataValues && dataValues.rolId !== undefined) {
      specificFields.roleId = dataValues.rolId;
    }
    if ('permisoId' in dataValues && dataValues.permisoId !== undefined) {
      specificFields.permissionId = dataValues.permisoId;
    }
    if ('accion' in dataValues && dataValues.accion !== undefined) {
      specificFields.action = dataValues.accion;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new RolePermission(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {RolePermission|Object} entity - Entidad RolePermission o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad RolePermission como objeto plano
    const data = entity instanceof RolePermission ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    return {
      rolId: data.roleId,
      permisoId: data.permissionId,
      accion: data.action,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de RolePermission
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {RolePermission|Object} entity - Entidad RolePermission o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad RolePermission como objeto plano
    const data = entity instanceof RolePermission ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de RolePermission
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('roleId' in data) {
      updateData.rolId = data.roleId;
    }
    if ('permissionId' in data) {
      updateData.permisoId = data.permissionId;
    }
    if ('action' in data) {
      updateData.accion = data.action;
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
   * @returns {RolePermission[]} Array de entidades RolePermission
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

