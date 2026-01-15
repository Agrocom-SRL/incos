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
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminaron findByUsername(), findByEmail() y findByRolId() porque son redundantes.
 * Usar en su lugar:
 * - findBy({ username: 'usuario' }) → Reemplaza findByUsername()
 * - findBy({ email: 'email@example.com' }) → Reemplaza findByEmail()
 * - findAll({ roleId: X }) → Reemplaza findByRolId()
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
   * Maneja todos los criterios de búsqueda de la entidad User
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findBy({ username: 'usuario' }) → Busca por username
   * - findBy({ email: 'email@example.com' }) → Busca por email
   * - findAll({ roleId: 1 }) → Busca usuarios por rol
   * - findAll({ state: 'BLOQUEADO' }) → Busca usuarios bloqueados
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - username: Nombre de usuario (búsqueda exacta, para búsqueda de texto usar search())
   *   - email: Email del usuario (búsqueda exacta, para búsqueda de texto usar search())
   *   - roleId: ID del rol
   *   - referenceId: ID de referencia
   *   - referenceType: Tipo de referencia
   *   - state: Estado del usuario (BLOQUEADO, SUSPENDIDO, RETIRADO, null = activo)
   *   - stateChangeDate: Fecha de cambio de estado
   *   - stateChangeReason: Motivo de cambio de estado
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.username !== undefined) {
      where.username = filters.username;
    }
    if (filters.email !== undefined) {
      where.email = filters.email.toLowerCase();
    }
    if (filters.roleId) {
      where.rolId = filters.roleId;
    }
    if (filters.referenceId !== undefined) {
      where.referenciaId = filters.referenceId;
    }
    if (filters.referenceType !== undefined) {
      where.tipoReferencia = filters.referenceType;
    }
    if (filters.state !== undefined) {
      where.estado = filters.state;
    }
    if (filters.stateChangeDate !== undefined) {
      where.fechaCambioEstado = filters.stateChangeDate;
    }
    if (filters.stateChangeReason !== undefined) {
      where.motivoCambioEstado = filters.stateChangeReason;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda de texto
   * Estos campos se usan en el método search() para búsqueda por término
   * 
   * @returns {string[]} Array de nombres de campos del modelo Sequelize
   */
  getSearchFields() {
    return ['username', 'email'];
  }

  /**
   * Retorna el orden por defecto para las consultas
   * Delega el orden al BaseRepository que ordena por ID ASC
   * 
   * @returns {Array} Array vacío para usar el orden por defecto del BaseRepository (id ASC)
   */
  getDefaultSort() {
    return []; // Usa el orden por defecto de BaseRepository: [['id', 'ASC']]
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
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'users';
  }
}

