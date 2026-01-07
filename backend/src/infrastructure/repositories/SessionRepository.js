import { ISesionRepository } from '../../domain/interfaces/repositories/ISesionRepository.js';
import { Sesion as SesionModel } from '../database/models/sesion.js';
import { BaseRepository } from './BaseRepository.js';
import { SessionMapper } from '../mappers/SessionMapper.js';

/**
 * Implementación del repositorio de sesiones usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a SessionMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa SessionMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ISesionRepository
 * - Usa SessionMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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
   * Delega la responsabilidad de mapeo a SessionMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Session|null} Entidad de dominio
   */
  toEntity(model) {
    return SessionMapper.toEntity(model);
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
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a SessionMapper
   * 
   * @param {Session|Object} data - Entidad Session o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return SessionMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a SessionMapper
   * 
   * @param {Session|Object} data - Entidad Session o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return SessionMapper.toModelForUpdate(data);
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
   * 
   * @param {string} tokenSesion - Token de sesión
   * @returns {Promise<Session|null>} Entidad Session o null
   */
  async findByToken(tokenSesion) {
    const model = await this.getModel().findOne({
      where: {
        tokenSesion: tokenSesion,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
    });
    return SessionMapper.toEntity(model);
  }

  /**
   * Método específico: Buscar sesiones por usuario
   * 
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Session[]>} Array de entidades Session
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
    return SessionMapper.toEntityList(models);
  }
}

