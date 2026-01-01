import { ISesionRepository } from '../../domain/interfaces/repositories/ISesionRepository.js';
import { Sesion as SesionModel } from '../database/models/sesion.js';
import { Session } from '../../domain/entities/Session.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de sesiones usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {ISesionRepository}
 * 
 * Esta clase cumple con el contrato ISesionRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByToken() y findByUsuarioId() que son requeridos por ISesionRepository
 */
export class SessionRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de sesiones
   * @returns {Object} Modelo Sesion
   */
  getModel() {
    return SesionModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {Session|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new Session({
      id: model.id,
      userId: model.usuarioId,
      sessionToken: model.tokenSesion,
      recoveryToken: model.tokenRecuperacion,
      expirationDate: model.fechaExpiracion,
      lastLogin: model.ultimoLogin,
      lastLoginIp: model.ipUltimoLogin,
      device: model.dispositivo,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.userId) {
      where.usuarioId = filters.userId;
    }
    if (filters.device) {
      where.dispositivo = filters.device;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['tokenSesion', 'tokenRecuperacion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['ultimoLogin', 'DESC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
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
   * Mapea datos de actualización de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

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
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }

    return updateData;
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'sessions';
  }

  /**
   * Método específico: Buscar sesión por token
   * @param {string} tokenSesion
   * @returns {Promise<Session|null>}
   */
  async findByToken(tokenSesion) {
    const model = await this.getModel().findOne({
      where: {
        tokenSesion: tokenSesion,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar sesiones por usuario
   * @param {number} usuarioId
   * @returns {Promise<Session[]>}
   */
  async findByUsuarioId(usuarioId) {
    const models = await this.getModel().findAll({
      where: {
        usuarioId: usuarioId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['ultimoLogin', 'DESC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

