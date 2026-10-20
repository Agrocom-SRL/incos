import { Actividad as ActividadModel } from '../database/models/actividad.js';
import { BaseRepository } from './BaseRepository.js';
import { ActivityMapper } from '../mappers/ActivityMapper.js';

/**
 * Implementación del repositorio de actividades usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a ActivityMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa ActivityMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IActividadRepository
 * - Usa ActivityMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IActividadRepository}
 *
 * Esta clase cumple con el contrato IActividadRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class ActivityRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de actividades
   * @returns {Object} Modelo Actividad
   */
  getModel() {
    return ActividadModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a ActivityMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {Activity|null} Entidad de dominio
   */
  toEntity(model) {
    return ActivityMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Activity
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ type: 'ACADEMICA' }) → Busca actividades académicas
   * - findAll({ isHighlighted: true }) → Busca actividades destacadas
   * - findBy({ name: 'Inscripciones' }) → Busca actividad específica
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - name: Nombre de la actividad (búsqueda exacta, para búsqueda de texto usar search())
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   *   - type: Tipo de actividad (INSCRIPCION, PLANIFICACION, ACADEMICA, etc.)
   *   - isHighlighted: Si es destacada (true/false)
   *   - icon: Icono
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
    if (filters.type) {
      where.tipo = filters.type;
    }
    if (filters.isHighlighted !== undefined) {
      where.esDestacada = filters.isHighlighted;
    }
    if (filters.icon !== undefined) {
      where.icono = filters.icon;
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
   * Delega la responsabilidad de mapeo a ActivityMapper
   *
   * @param {Activity|Object} data - Entidad Activity o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return ActivityMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a ActivityMapper
   *
   * @param {Activity|Object} data - Entidad Activity o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return ActivityMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'activities';
  }
}
