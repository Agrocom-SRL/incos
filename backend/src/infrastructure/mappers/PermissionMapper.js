import { Permission } from '../../domain/entities/Permission.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: PermissionMapper
 *
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Permission)
 *
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Permission
 *
 * Ubicación: Infrastructure Layer (detalle Sequelize)
 *
 * Clean Architecture:
 * - Domain Layer: Permission (entidad pura)
 * - Infrastructure: BaseMapper + PermissionMapper + PermissionRepository
 */
export class PermissionMapper {
  /**
   * Base de Datos → ORM Model → Domain Entity
   *
   * @param {Object|null} model - Modelo Sequelize de Permiso
   * @returns {Permission|null}
   */
  static toEntity(model) {
    if (!model) return null;

    const dataValues = model.dataValues || model;
    const specificFields = {};

    // Mapeo: atributos del modelo (camelCase Sequelize) → dominio (inglés)
    if ('codigo' in dataValues && dataValues.codigo !== undefined) {
      specificFields.code = dataValues.codigo;
    }
    if ('nombre' in dataValues && dataValues.nombre !== undefined) {
      specificFields.name = dataValues.nombre;
    }
    if ('descripcion' in dataValues && dataValues.descripcion !== undefined) {
      specificFields.description = dataValues.descripcion;
    }
    if ('dominio' in dataValues && dataValues.dominio !== undefined) {
      specificFields.domain = dataValues.dominio;
    }
    if ('modulo' in dataValues && dataValues.modulo !== undefined) {
      specificFields.module = dataValues.modulo;
    }
    if ('grupoUi' in dataValues && dataValues.grupoUi !== undefined) {
      specificFields.uiGroup = dataValues.grupoUi;
    }
    if ('rutaSidebar' in dataValues && dataValues.rutaSidebar !== undefined) {
      specificFields.sidebarRoute = dataValues.rutaSidebar;
    }

    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    return new Permission(entityData);
  }

  /**
   * Domain Entity → ORM Model → INSERT
   *
   * NOTA: 'activo' lo gestiona BaseRepository.create()
   *
   * @param {Permission|Object} entity
   * @returns {Object}
   */
  static toModel(entity) {
    const data = entity instanceof Permission ? entity.toPlainObject() : entity;

    return {
      codigo: data.code,
      nombre: data.name,
      descripcion: data.description ?? null,
      dominio: data.domain,
      modulo: data.module,
      grupoUi: data.uiGroup ?? null,
      rutaSidebar: data.sidebarRoute ?? null,
    };
  }

  /**
   * Domain Entity → ORM Model → UPDATE (solo campos presentes en la entidad)
   *
   * @param {Permission|Object} entity
   * @returns {Object}
   */
  static toModelForUpdate(entity) {
    const data = entity instanceof Permission ? entity.toPlainObject() : entity;
    const updateData = {};

    if ('code' in data) {
      updateData.codigo = data.code;
    }
    if ('name' in data) {
      updateData.nombre = data.name;
    }
    if ('description' in data) {
      updateData.descripcion = data.description ?? null;
    }
    if ('domain' in data) {
      updateData.dominio = data.domain;
    }
    if ('module' in data) {
      updateData.modulo = data.module;
    }
    if ('uiGroup' in data) {
      updateData.grupoUi = data.uiGroup ?? null;
    }
    if ('sidebarRoute' in data) {
      updateData.rutaSidebar = data.sidebarRoute ?? null;
    }

    const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
    Object.assign(updateData, baseFields);

    return updateData;
  }

  /**
   * @param {Array} models
   * @returns {Permission[]}
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((m) => this.toEntity(m)).filter((e) => e !== null);
  }
}
