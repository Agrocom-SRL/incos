import { User } from '../../domain/entities/User.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: UserMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (User)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de User
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de User
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: User (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + UserMapper (campos específicos)
 * - Infrastructure Layer: UserRepository (usa el mapper para conversiones)
 */
export class UserMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de User
   * 
   * @param {Object|null} model - Modelo Sequelize de Usuario
   * @returns {User|null} Entidad de dominio User
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de User (campos del dominio)
    const specificFields = {
      username: model.username,
      email: model.email,
      passwordHash: model.passwordHash,
      photoUrl: model.fotoUrl,
      roleId: model.rolId,
      referenceId: model.referenciaId,
      referenceType: model.tipoReferencia,
      state: model.estado,
      stateChangeDate: model.fechaCambioEstado,
      stateChangeReason: model.motivoCambioEstado,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new User(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {User|Object} entity - Entidad User o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad User como objeto plano
    const data = entity instanceof User ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      fotoUrl: data.photoUrl || null,
      rolId: data.roleId || null,
      referenciaId: data.referenceId || null,
      tipoReferencia: data.referenceType || null,
      estado: data.state || null,
      fechaCambioEstado: data.stateChangeDate || null,
      motivoCambioEstado: data.stateChangeReason || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de User
   * 
   * @param {User|Object} entity - Entidad User o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad User como objeto plano
    const data = entity instanceof User ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de User
    if (data.username !== undefined) {
      updateData.username = data.username;
    }
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.passwordHash !== undefined) {
      updateData.passwordHash = data.passwordHash;
    }
    if (data.photoUrl !== undefined) {
      updateData.fotoUrl = data.photoUrl || null;
    }
    if (data.roleId !== undefined) {
      updateData.rolId = data.roleId || null;
    }
    if (data.referenceId !== undefined) {
      updateData.referenciaId = data.referenceId || null;
    }
    if (data.referenceType !== undefined) {
      updateData.tipoReferencia = data.referenceType || null;
    }
    if (data.state !== undefined) {
      updateData.estado = data.state || null;
    }
    if (data.stateChangeDate !== undefined) {
      updateData.fechaCambioEstado = data.stateChangeDate || null;
    }
    if (data.stateChangeReason !== undefined) {
      updateData.motivoCambioEstado = data.stateChangeReason || null;
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
   * @returns {User[]} Array de entidades User
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

