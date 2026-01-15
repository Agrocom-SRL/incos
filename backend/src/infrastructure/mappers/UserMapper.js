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
   * Solo incluye campos que existen en el modelo (útil cuando se usan attributes limitados)
   * 
   * Flujo: Base de Datos → ORM Model → Domain Entity
   * 
   * @param {Object|null} model - Modelo Sequelize de Usuario
   * @returns {User|null} Entidad de dominio User
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de User (campos del dominio)
    // Acceder a dataValues para obtener solo los campos solicitados
    // Cuando se usan attributes limitados, Sequelize almacena los campos en dataValues
    const dataValues = model.dataValues || model;
    const specificFields = {};
    
    // Mapeo: BD (snake_case español) → Dominio (camelCase inglés)
    if ('username' in dataValues && dataValues.username !== undefined) {
      specificFields.username = dataValues.username;
    }
    if ('email' in dataValues && dataValues.email !== undefined) {
      specificFields.email = dataValues.email;
    }
    if ('passwordHash' in dataValues && dataValues.passwordHash !== undefined) {
      specificFields.passwordHash = dataValues.passwordHash;
    }
    if ('fotoUrl' in dataValues && dataValues.fotoUrl !== undefined) {
      specificFields.photoUrl = dataValues.fotoUrl;
    }
    if ('rolId' in dataValues && dataValues.rolId !== undefined) {
      specificFields.roleId = dataValues.rolId;
    }
    if ('referenciaId' in dataValues && dataValues.referenciaId !== undefined) {
      specificFields.referenceId = dataValues.referenciaId;
    }
    if ('tipoReferencia' in dataValues && dataValues.tipoReferencia !== undefined) {
      specificFields.referenceType = dataValues.tipoReferencia;
    }
    if ('estado' in dataValues && dataValues.estado !== undefined) {
      specificFields.state = dataValues.estado;
    }
    if ('fechaCambioEstado' in dataValues && dataValues.fechaCambioEstado !== undefined) {
      specificFields.stateChangeDate = dataValues.fechaCambioEstado;
    }
    if ('motivoCambioEstado' in dataValues && dataValues.motivoCambioEstado !== undefined) {
      specificFields.stateChangeReason = dataValues.motivoCambioEstado;
    }

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new User(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (INSERT)
   * 
   * NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
   * BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
   * 
   * @param {User|Object} entity - Entidad User o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad User como objeto plano
    const data = entity instanceof User ? entity.toPlainObject() : entity;

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
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
   * Solo incluye los campos que están definidos (que existen en la entidad)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de User
   * 
   * Flujo: Domain Entity → ORM Model → Base de Datos (UPDATE)
   * 
   * @param {User|Object} entity - Entidad User o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad User como objeto plano
    const data = entity instanceof User ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de User
    // Solo incluir campos que existen en la entidad (usando operador 'in')
    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if ('username' in data) {
      updateData.username = data.username;
    }
    if ('email' in data) {
      updateData.email = data.email;
    }
    if ('passwordHash' in data) {
      updateData.passwordHash = data.passwordHash;
    }
    if ('photoUrl' in data) {
      updateData.fotoUrl = data.photoUrl || null;
    }
    if ('roleId' in data) {
      updateData.rolId = data.roleId || null;
    }
    if ('referenceId' in data) {
      updateData.referenciaId = data.referenceId || null;
    }
    if ('referenceType' in data) {
      updateData.tipoReferencia = data.referenceType || null;
    }
    if ('state' in data) {
      updateData.estado = data.state || null;
    }
    if ('stateChangeDate' in data) {
      updateData.fechaCambioEstado = data.stateChangeDate || null;
    }
    if ('stateChangeReason' in data) {
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

