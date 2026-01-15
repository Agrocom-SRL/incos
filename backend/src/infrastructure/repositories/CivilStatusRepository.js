import { IEstadoCivilRepository } from '../../domain/interfaces/repositories/IEstadoCivilRepository.js';
import { EstadoCivil as EstadoCivilModel } from '../database/models/estado_civil.js';
import { BaseRepository } from './BaseRepository.js';
import { CivilStatusMapper } from '../mappers/CivilStatusMapper.js';

/**
 * Implementación del repositorio de estados civiles usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CivilStatusMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CivilStatusMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstadoCivilRepository
 * - Usa CivilStatusMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEstadoCivilRepository}
 * 
 * Esta clase cumple con el contrato IEstadoCivilRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class CivilStatusRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de estados civiles
   * @returns {Object} Modelo EstadoCivil
   */
  getModel() {
    return EstadoCivilModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a CivilStatusMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {CivilStatus|null} Entidad de dominio
   */
  toEntity(model) {
    return CivilStatusMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad CivilStatus
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findBy({ abbreviation: 'S' }) → Busca estado civil por abreviatura
   * - findAll({ name: 'Soltero' }) → Busca por nombre exacto
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - name: Nombre del estado civil (búsqueda exacta, para búsqueda de texto usar search())
   *   - abbreviation: Abreviatura (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.abbreviation !== undefined) {
      where.abreviatura = filters.abbreviation;
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
    return ['nombre', 'abreviatura'];
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
   * Delega la responsabilidad de mapeo a CivilStatusMapper
   * 
   * @param {CivilStatus|Object} data - Entidad CivilStatus o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return CivilStatusMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CivilStatusMapper
   * 
   * @param {CivilStatus|Object} data - Entidad CivilStatus o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return CivilStatusMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'civilStatuses';
  }
}

