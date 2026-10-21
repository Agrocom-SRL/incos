import { TipoDiscapacidad as TipoDiscapacidadModel } from '../database/models/tipo_discapacidad.js';
import { BaseRepository } from './BaseRepository.js';
import { DisabilityTypeMapper } from '../mappers/DisabilityTypeMapper.js';

/**
 * Implementación del repositorio de tipos de discapacidad usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a DisabilityTypeMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa DisabilityTypeMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ITipoDiscapacidadRepository
 * - Usa DisabilityTypeMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {ITipoDiscapacidadRepository}
 *
 * Esta clase cumple con el contrato ITipoDiscapacidadRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class DisabilityTypeRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de tipos de discapacidad
   * @returns {Object} Modelo TipoDiscapacidad
   */
  getModel() {
    return TipoDiscapacidadModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a DisabilityTypeMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {DisabilityType|null} Entidad de dominio
   */
  toEntity(model) {
    return DisabilityTypeMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad DisabilityType
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findBy({ name: 'Visual' }) → Busca tipo de discapacidad por nombre
   * - findAll({ description: 'Discapacidad visual' }) → Busca por descripción exacta
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - name: Nombre del tipo de discapacidad (búsqueda exacta, para búsqueda de texto usar search())
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.description !== undefined) {
      where.descripcion = filters.description;
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
    return ['nombre', 'descripcion'];
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
   * Delega la responsabilidad de mapeo a DisabilityTypeMapper
   *
   * @param {DisabilityType|Object} data - Entidad DisabilityType o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return DisabilityTypeMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a DisabilityTypeMapper
   *
   * @param {DisabilityType|Object} data - Entidad DisabilityType o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return DisabilityTypeMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'disabilityTypes';
  }
}
