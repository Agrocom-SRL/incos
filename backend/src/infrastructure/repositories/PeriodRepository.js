import { IPeriodoRepository } from '../../domain/interfaces/repositories/IPeriodoRepository.js';
import { Periodo as PeriodoModel } from '../database/models/periodo.js';
import { BaseRepository } from './BaseRepository.js';
import { PeriodMapper } from '../mappers/PeriodMapper.js';

/**
 * Implementación del repositorio de periodos académicos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a PeriodMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa PeriodMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPeriodoRepository
 * - Usa PeriodMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IPeriodoRepository}
 * 
 * Esta clase cumple con el contrato IPeriodoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminó findByCarreraId() porque es redundante.
 * Usar en su lugar:
 * - findAll({ studyPlanId: X }) → Busca periodos de un plan de estudios
 */
export class PeriodRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de periodos
   * @returns {Object} Modelo Periodo
   */
  getModel() {
    return PeriodoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a PeriodMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Period|null} Entidad de dominio
   */
  toEntity(model) {
    return PeriodMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Period
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ studyPlanId: 1 }) → Busca periodos de un plan de estudios
   * - findBy({ studyPlanId: 1, number: 1 }) → Busca periodo específico
   * - findAll({ displayOrder: 1 }) → Busca por orden de visualización
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studyPlanId: ID del plan de estudios
   *   - name: Nombre del periodo (búsqueda exacta, para búsqueda de texto usar search())
   *   - number: Número del periodo
   *   - displayOrder: Orden de visualización
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studyPlanId) {
      where.planEstudioId = filters.studyPlanId;
    }
    if (filters.name !== undefined) {
      where.nombre = filters.name;
    }
    if (filters.number !== undefined) {
      where.numero = filters.number;
    }
    if (filters.displayOrder !== undefined) {
      where.ordenVisualizacion = filters.displayOrder;
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
   * Delega la responsabilidad de mapeo a PeriodMapper
   * 
   * @param {Period|Object} data - Entidad Period o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return PeriodMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a PeriodMapper
   * 
   * @param {Period|Object} data - Entidad Period o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return PeriodMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'periods';
  }
}

