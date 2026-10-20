import { IDepartamentoRepository } from '../../domain/interfaces/repositories/IDepartamentoRepository.js';
import { Departamento as DepartamentoModel } from '../database/models/departamento.js';
import { BaseRepository } from './BaseRepository.js';
import { DepartmentMapper } from '../mappers/DepartmentMapper.js';

/**
 * Implementación del repositorio de departamentos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a DepartmentMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa DepartmentMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IDepartamentoRepository
 * - Usa DepartmentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IDepartamentoRepository}
 *
 * Esta clase cumple con el contrato IDepartamentoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 *
 * IMPORTANTE: Se eliminaron findByPaisId() y findByCodigo() porque son redundantes.
 * Usar en su lugar:
 * - findAll({ countryId: X }) → Reemplaza findByPaisId()
 * - findBy({ code: 'LP' }) → Reemplaza findByCodigo()
 */
export class DepartmentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de departamentos
   * @returns {Object} Modelo Departamento
   */
  getModel() {
    return DepartamentoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a DepartmentMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {Department|null} Entidad de dominio
   */
  toEntity(model) {
    return DepartmentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Department
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ countryId: 1 }) → Busca departamentos de un país
   * - findBy({ code: 'LP' }) → Busca departamento por código
   * - findAll({ name: 'La Paz' }) → Busca por nombre exacto
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - countryId: ID del país
   *   - name: Nombre del departamento (búsqueda exacta, para búsqueda de texto usar search())
   *   - code: Código del departamento (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.countryId) {
      where.paisId = filters.countryId;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.code !== undefined) {
      where.codigo = filters.code;
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
    return ['nombre', 'codigo'];
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
   * Delega la responsabilidad de mapeo a DepartmentMapper
   *
   * @param {Department|Object} data - Entidad Department o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return DepartmentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a DepartmentMapper
   *
   * @param {Department|Object} data - Entidad Department o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return DepartmentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'departments';
  }
}
