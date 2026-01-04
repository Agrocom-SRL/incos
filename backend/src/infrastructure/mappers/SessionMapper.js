import { Session } from '../../domain/entities/Session.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: SessionMapper
 * 
 * Responsabilidad única: Conversión entre Modelo ORM (Sequelize) ↔ Entidad de Dominio (Session)
 * 
 * Patrón: Usa BaseMapper para campos comunes, solo maneja campos específicos de Session
 * 
 * Ubicación: Infrastructure Layer (es un detalle de implementación específico de Sequelize)
 * 
 * Principios SOLID aplicados:
 * - Single Responsibility: Solo se encarga de mapear campos específicos de Session
 * - Open/Closed: Extiende funcionalidad de BaseMapper sin modificarlo
 * - Dependency Inversion: Depende de la entidad de dominio, no de implementaciones concretas
 * 
 * Clean Architecture:
 * - Domain Layer: Session (entidad pura)
 * - Infrastructure Layer: BaseMapper (campos comunes) + SessionMapper (campos específicos)
 * - Infrastructure Layer: SessionRepository (usa el mapper para conversiones)
 */
export class SessionMapper {
  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Session
   * 
   * @param {Object|null} model - Modelo Sequelize de Sesion
   * @returns {Session|null} Entidad de dominio Session
   */
  static toEntity(model) {
    if (!model) return null;

    // Campos específicos de Session (campos del dominio)
    const specificFields = {
      userId: model.usuarioId,
      sessionToken: model.tokenSesion,
      recoveryToken: model.tokenRecuperacion,
      expirationDate: model.fechaExpiracion,
      lastLogin: model.ultimoLogin,
      lastLoginIp: model.ipUltimoLogin,
      device: model.dispositivo,
    };

    // Combina campos base (id, active, timestamps, audit) con campos específicos
    const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);
    
    return new Session(entityData);
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para creación)
   * 
   * @param {Session|Object} entity - Entidad Session o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  static toModel(entity) {
    // Acepta tanto entidad Session como objeto plano
    const data = entity instanceof Session ? entity.toPlainObject() : entity;

    // NOTA: 'activo' NO se incluye aquí porque BaseRepository.create() lo maneja
    // BaseRepository establece: activo: data.activo !== undefined ? data.activo : true
    return {
      usuarioId: data.userId || null,
      tokenSesion: data.sessionToken || null,
      tokenRecuperacion: data.recoveryToken || null,
      fechaExpiracion: data.expirationDate || null,
      ultimoLogin: data.lastLogin || null,
      ipUltimoLogin: data.lastLoginIp || null,
      dispositivo: data.device || null,
    };
  }

  /**
   * Convierte una entidad de dominio a formato del modelo Sequelize (para actualización)
   * Solo incluye los campos que están definidos (no undefined)
   * Usa BaseMapper para campos comunes y solo mapea campos específicos de Session
   * 
   * @param {Session|Object} entity - Entidad Session o objeto con datos de dominio
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  static toModelForUpdate(entity) {
    // Acepta tanto entidad Session como objeto plano
    const data = entity instanceof Session ? entity.toPlainObject() : entity;
    const updateData = {};

    // Campos específicos de Session
    if (data.userId !== undefined) {
      updateData.usuarioId = data.userId || null;
    }
    if (data.sessionToken !== undefined) {
      updateData.tokenSesion = data.sessionToken || null;
    }
    if (data.recoveryToken !== undefined) {
      updateData.tokenRecuperacion = data.recoveryToken || null;
    }
    if (data.expirationDate !== undefined) {
      updateData.fechaExpiracion = data.expirationDate || null;
    }
    if (data.lastLogin !== undefined) {
      updateData.ultimoLogin = data.lastLogin || null;
    }
    if (data.lastLoginIp !== undefined) {
      updateData.ipUltimoLogin = data.lastLoginIp || null;
    }
    if (data.device !== undefined) {
      updateData.dispositivo = data.device || null;
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
   * @returns {Session[]} Array de entidades Session
   */
  static toEntityList(models) {
    if (!models || !Array.isArray(models)) return [];
    return models.map((model) => this.toEntity(model)).filter((entity) => entity !== null);
  }
}

