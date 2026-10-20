import { Municipio as MunicipioModel } from '../database/models/municipio.js';
import { BaseRepository } from './BaseRepository.js';
import { MunicipalityMapper } from '../mappers/MunicipalityMapper.js';

/**
 * Implementación del repositorio de municipios usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a MunicipalityMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa MunicipalityMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IMunicipioRepository
 * - Usa MunicipalityMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IMunicipioRepository}
 *
 * Esta clase cumple con el contrato IMunicipioRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 *
 * IMPORTANTE: Se eliminaron findByProvinciaId() y findByCodigo() porque son redundantes.
 * Usar en su lugar:
 * - findAll({ provinceId: X }) → Reemplaza findByProvinciaId()
 * - findBy({ code: 'LP' }) → Reemplaza findByCodigo()
 */
export class MunicipalityRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de municipios
   * @returns {Object} Modelo Municipio
   */
  getModel() {
    return MunicipioModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a MunicipalityMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {Municipality|null} Entidad de dominio
   */
  toEntity(model) {
    return MunicipalityMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Municipality
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ provinceId: 1 }) → Busca municipios de una provincia
   * - findBy({ code: 'LP' }) → Busca municipio por código
   * - findAll({ name: 'La Paz' }) → Busca por nombre exacto
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - provinceId: ID de la provincia
   *   - name: Nombre del municipio (búsqueda exacta, para búsqueda de texto usar search())
   *   - code: Código del municipio (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.provinceId) {
      where.provinciaId = filters.provinceId;
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
   * Delega la responsabilidad de mapeo a MunicipalityMapper
   *
   * @param {Municipality|Object} data - Entidad Municipality o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return MunicipalityMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a MunicipalityMapper
   *
   * @param {Municipality|Object} data - Entidad Municipality o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return MunicipalityMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'municipalities';
  }
}
