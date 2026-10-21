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
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 *
 * IMPORTANTE: Se eliminaron findByToken() y findByUsuarioId() porque son redundantes.
 * Usar en su lugar:
 * - findBy({ sessionToken: 'token' }) → Reemplaza findByToken()
 * - findAll({ userId: X }) → Reemplaza findByUsuarioId()
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
   * Maneja todos los criterios de búsqueda de la entidad Session
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ userId: 1 }) → Busca sesiones de un usuario
   * - findBy({ sessionToken: 'token123' }) → Busca sesión por token
   * - findAll({ device: 'MOVIL' }) → Busca sesiones móviles
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - userId: ID del usuario
   *   - sessionToken: Token de sesión (búsqueda exacta, para búsqueda de texto usar search())
   *   - recoveryToken: Token de recuperación (búsqueda exacta, para búsqueda de texto usar search())
   *   - expirationDate: Fecha de expiración
   *   - lastLogin: Último login
   *   - lastLoginIp: IP del último login
   *   - device: Tipo de dispositivo (MOVIL, TABLET, DESKTOP)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.userId) {
      where.usuarioId = filters.userId;
    }
    if (filters.sessionToken !== undefined) {
      where.tokenSesion = filters.sessionToken;
    }
    if (filters.recoveryToken !== undefined) {
      where.tokenRecuperacion = filters.recoveryToken;
    }
    if (filters.expirationDate !== undefined) {
      where.fechaExpiracion = filters.expirationDate;
    }
    if (filters.lastLogin !== undefined) {
      where.ultimoLogin = filters.lastLogin;
    }
    if (filters.lastLoginIp !== undefined) {
      where.ipUltimoLogin = filters.lastLoginIp;
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
  mapDataToModel(data, _userId = null) {
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
  mapDataToUpdate(data, _userId = null) {
    return SessionMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'sessions';
  }
}
