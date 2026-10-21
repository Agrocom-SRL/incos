import { EstudianteDiscapacidad as EstudianteDiscapacidadModel } from '../database/models/estudiante_discapacidad.js';
import { BaseRepository } from './BaseRepository.js';
import { StudentDisabilityMapper } from '../mappers/StudentDisabilityMapper.js';

/**
 * Repositorio de discapacidades de estudiantes
 * Utiliza el patrón Template Method heredando de BaseRepository
 *
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a StudentDisabilityMapper
 *
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa StudentDisabilityMapper para conversiones (depende de abstracción)
 *
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEstudianteDiscapacidadRepository
 * - Usa StudentDisabilityMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 *
 * @implements {IEstudianteDiscapacidadRepository}
 *
 * Esta clase cumple con el contrato IEstudianteDiscapacidadRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - NOTA: createMultiple y deleteByEstudianteId deben moverse a casos de uso
 */
export class StudentDisabilityRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize
   * @returns {Object} Modelo EstudianteDiscapacidad
   */
  getModel() {
    return EstudianteDiscapacidadModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a StudentDisabilityMapper
   *
   * @param {Object} model - Modelo Sequelize
   * @returns {StudentDisability|null} Entidad de dominio
   */
  toEntity(model) {
    return StudentDisabilityMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad StudentDisability
   *
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   *
   * Ejemplos de uso:
   * - findAll({ studentId: 1 }) → Busca discapacidades de un estudiante
   * - findAll({ disabilityTypeId: 2 }) → Busca estudiantes con un tipo de discapacidad
   * - findBy({ studentId: 1, disabilityTypeId: 2 }) → Busca discapacidad específica
   *
   * @param {Object} filters - Filtros de búsqueda
   *   - studentId: ID del estudiante
   *   - disabilityTypeId: ID del tipo de discapacidad
   *   - description: Descripción (búsqueda exacta, para búsqueda de texto usar search())
   *   - disabilityDegree: Grado de discapacidad (LEVE, MODERADO, SEVERO, PROFUNDO)
   *   - cause: Causa de la discapacidad (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studentId) {
      where.estudianteId = filters.studentId;
    }
    if (filters.disabilityTypeId) {
      where.tipoDiscapacidadId = filters.disabilityTypeId;
    }
    if (filters.description !== undefined) {
      where.descripcion = filters.description;
    }
    if (filters.disabilityDegree) {
      where.gradoDiscapacidad = filters.disabilityDegree;
    }
    if (filters.cause !== undefined) {
      where.causa = filters.cause;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['descripcion'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a StudentDisabilityMapper
   *
   * @param {StudentDisability|Object} data - Entidad StudentDisability o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, _userId = null) {
    return StudentDisabilityMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a StudentDisabilityMapper
   *
   * @param {StudentDisability|Object} data - Entidad StudentDisability o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, _userId = null) {
    return StudentDisabilityMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   *
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'studentDisabilities';
  }
}
