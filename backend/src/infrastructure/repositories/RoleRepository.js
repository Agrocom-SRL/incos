import { IRolRepository } from '../../domain/interfaces/repositories/IRolRepository.js';
import { Rol as RolModel } from '../database/models/rol.js';
import { BaseRepository } from './BaseRepository.js';
import { RoleMapper } from '../mappers/RoleMapper.js';

/**
 * Implementación del repositorio de roles usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a RoleMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa RoleMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IRolRepository
 * - Usa RoleMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IRolRepository}
 * 
 * Esta clase cumple con el contrato IRolRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminó findByCodigo() porque es redundante.
 * Usar en su lugar:
 * - findBy({ code: 'ADMIN' }) → Reemplaza findByCodigo()
 */
export class RoleRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de roles
   * @returns {Object} Modelo Rol
   */
  getModel() {
    return RolModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a RoleMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Role|null} Entidad de dominio
   */
  toEntity(model) {
    return RoleMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Role
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findBy({ code: 'ADMIN' }) → Busca rol por código
   * - findAll({ isSystem: true }) → Busca roles de sistema
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - code: Código del rol (búsqueda exacta, para búsqueda de texto usar search())
   *   - name: Nombre del rol (búsqueda exacta, para búsqueda de texto usar search())
   *   - isSystem: Flag de rol protegido del sistema
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.code !== undefined) {
      where.codigo = filters.code;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.isSystem !== undefined) {
      where.isSystem = Boolean(filters.isSystem);
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
    return ['codigo', 'nombre'];
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
   * Delega la responsabilidad de mapeo a RoleMapper
   * 
   * @param {Role|Object} data - Entidad Role o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return RoleMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a RoleMapper
   * 
   * @param {Role|Object} data - Entidad Role o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return RoleMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'roles';
  }

  /**
   * Roles activos ordenados por nombre (panel SEG).
   */
  async findAllOrderedByName() {
    const Model = this.getModel();
    const rows = await Model.findAll({
      where: { activo: true },
      order: [
        ['nombre', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    return rows.map((m) => this.toEntity(m));
  }
}

