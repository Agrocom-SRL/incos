import { IUsuarioRepository } from '../../domain/interfaces/repositories/IUsuarioRepository.js';
import { Usuario as UsuarioModel } from '../database/models/Usuario.js';
import { User } from '../../domain/entities/User.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de usuarios usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {IUsuarioRepository}
 * 
 * Esta clase cumple con el contrato IUsuarioRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByUsername(), findByEmail() y findByRolId() que son requeridos por IUsuarioRepository
 */
export class UserRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de usuarios
   * @returns {Object} Modelo Usuario
   */
  getModel() {
    return UsuarioModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {User|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new User({
      id: model.id,
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

    if (filters.roleId) {
      where.rolId = filters.roleId;
    }
    if (filters.state !== undefined) {
      where.estado = filters.state;
    }
    if (filters.referenceType) {
      where.tipoReferencia = filters.referenceType;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['username', 'email'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['username', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
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
   * Mapea datos de actualización de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

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
    return 'users';
  }

  /**
   * Método específico: Buscar usuario por username
   * @param {string} username
   * @returns {Promise<User|null>}
   */
  async findByUsername(username) {
    const model = await this.getModel().findOne({
      where: {
        username: username,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar usuario por email
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  async findByEmail(email) {
    const model = await this.getModel().findOne({
      where: {
        email: email.toLowerCase(),
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return this.toEntity(model);
  }

  /**
   * Método específico: Buscar usuarios por rol
   * @param {number} rolId
   * @returns {Promise<User[]>}
   */
  async findByRolId(rolId) {
    const models = await this.getModel().findAll({
      where: {
        rolId: rolId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['username', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

