import { IPrerrequisitoRepository } from '../../domain/interfaces/repositories/IPrerrequisitoRepository.js';
import { Prerrequisito as PrerrequisitoModel } from '../database/models/prerrequisito.js';
import { BaseRepository } from './BaseRepository.js';
import { PrerequisiteMapper } from '../mappers/PrerequisiteMapper.js';

/**
 * Implementación del repositorio de prerrequisitos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a PrerequisiteMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa PrerequisiteMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IPrerrequisitoRepository
 * - Usa PrerequisiteMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IPrerrequisitoRepository}
 * 
 * Esta clase cumple con el contrato IPrerrequisitoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 * 
 * IMPORTANTE: Se eliminó findByMateriaId() porque es redundante.
 * Usar en su lugar:
 * - findAll({ subjectId: X }) → Reemplaza findByMateriaId()
 */
export class PrerequisiteRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de prerrequisitos
   * @returns {Object} Modelo Prerrequisito
   */
  getModel() {
    return PrerrequisitoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a PrerequisiteMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Prerequisite|null} Entidad de dominio
   */
  toEntity(model) {
    return PrerequisiteMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Prerequisite
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ subjectId: 1 }) → Busca prerrequisitos de una materia
   * - findAll({ prerequisiteId: 2 }) → Busca materias que requieren un prerrequisito específico
   * - findBy({ subjectId: 1, prerequisiteId: 2 }) → Busca prerrequisito específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studyPlanId: ID del plan de estudios
   *   - subjectId: ID de la materia que requiere el prerrequisito
   *   - prerequisiteId: ID de la materia que es prerrequisito
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studyPlanId) {
      where.planEstudioId = filters.studyPlanId;
    }
    if (filters.subjectId) {
      where.asignaturaId = filters.subjectId;
    }
    if (filters.prerequisiteId) {
      where.prerrequisitoId = filters.prerequisiteId;
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
    return ['descripcion'];
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
   * Delega la responsabilidad de mapeo a PrerequisiteMapper
   * 
   * @param {Prerequisite|Object} data - Entidad Prerequisite o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return PrerequisiteMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a PrerequisiteMapper
   * 
   * @param {Prerequisite|Object} data - Entidad Prerequisite o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return PrerequisiteMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'prerequisites';
  }
}

