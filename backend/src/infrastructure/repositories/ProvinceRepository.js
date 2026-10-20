import { Provincia as ProvinciaModel } from '../database/models/provincia.js';
import { BaseRepository } from './BaseRepository.js';
import { ProvinceMapper } from '../mappers/ProvinceMapper.js';

/**
 * Implementación del repositorio de provincias usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ProvinceMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ProvinceMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IProvinciaRepository
 * - Usa ProvinceMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IProvinciaRepository}
 *
 * Esta clase cumple con el contrato IProvinciaRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 *
 * IMPORTANTE: Se eliminaron findByDepartamentoId() y findByCodigo() porque son redundantes.
 * Usar en su lugar:
 * - findAll({ departmentId: X }) → Reemplaza findByDepartamentoId()
 * - findBy({ code: 'LP' }) → Reemplaza findByCodigo()
 */
export class ProvinceRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de provincias
   * @returns {Object} Modelo Provincia
   */
  getModel() {
    return ProvinciaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a ProvinceMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {Province|null} Entidad de dominio
   */
  toEntity(model) {
    return ProvinceMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Province
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ departmentId: 1 }) → Busca provincias de un departamento
   * - findBy({ code: 'LP' }) → Busca provincia por código
   * - findAll({ name: 'La Paz' }) → Busca por nombre exacto
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - departmentId: ID del departamento
   *   - name: Nombre de la provincia (búsqueda exacta, para búsqueda de texto usar search())
   *   - code: Código de la provincia (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.departmentId) {
      where.departamentoId = filters.departmentId;
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
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['nombre', 'codigo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a ProvinceMapper
   *
   * @param {Province|Object} data - Entidad Province o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return ProvinceMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ProvinceMapper
   *
   * @param {Province|Object} data - Entidad Province o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return ProvinceMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'provinces';
  }
}
