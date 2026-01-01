import { IUsuarioRepository } from '../../domain/interfaces/repositories/IUsuarioRepository.js';
import { Usuario as UsuarioModel } from '../database/models/usuario.js';
import { BaseRepository } from './BaseRepository.js';
import { UserMapper } from '../mappers/UserMapper.js';

/**
 * Implementación del repositorio de usuarios usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a UserMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa UserMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IUsuarioRepository
 * - Usa UserMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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
   * Delega la responsabilidad de mapeo a UserMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {User|null} Entidad de dominio
   */
  toEntity(model) {
    return UserMapper.toEntity(model);
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
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a UserMapper
   * 
   * @param {User|Object} data - Entidad User o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return UserMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a UserMapper
   * 
   * @param {User|Object} data - Entidad User o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return UserMapper.toModelForUpdate(data);
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
   * 
   * @param {string} username - Nombre de usuario
   * @returns {Promise<User|null>} Entidad User o null si no se encuentra
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
   * 
   * @param {string} email - Email del usuario (se normaliza a minúsculas)
   * @returns {Promise<User|null>} Entidad User o null si no se encuentra
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
   * 
   * @param {number} rolId - ID del rol
   * @returns {Promise<User[]>} Array de entidades User
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
    return UserMapper.toEntityList(models);
  }
}

