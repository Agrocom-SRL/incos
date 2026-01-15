import { IEnrollmentRepository } from '../../domain/interfaces/repositories/IEnrollmentRepository.js';
import { Inscripcion as InscripcionModel } from '../database/models/inscripcion.js';
import { BaseRepository } from './BaseRepository.js';
import { EnrollmentMapper } from '../mappers/EnrollmentMapper.js';

/**
 * Implementación del repositorio de inscripciones usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a EnrollmentMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa EnrollmentMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEnrollmentRepository
 * - Usa EnrollmentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEnrollmentRepository}
 * 
 * Esta clase cumple con el contrato IEnrollmentRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class EnrollmentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de inscripciones
   * @returns {Object} Modelo Inscripcion
   */
  getModel() {
    return InscripcionModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a EnrollmentMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {Enrollment|null} Entidad de dominio
   */
  toEntity(model) {
    return EnrollmentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad Enrollment
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ studentAcademicDataId: 1 }) → Busca por estudiante
   * - findAll({ managementId: 2 }) → Busca por gestión
   * - findBy({ studentAcademicDataId: 1, managementId: 2 }) → Busca por ambos
   * - findAll({ enrollmentDate: '2025-01-15' }) → Busca por fecha de inscripción
   * - findAll({ observations: 'Texto exacto' }) → Busca por observaciones exactas
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentAcademicDataId: ID de datos académicos del estudiante
   *   - managementId: ID de la gestión académica
   *   - enrollmentType: Tipo de inscripción (NUEVO, CONTINUIDAD, REINGRESO, etc.)
   *   - enrollmentDate: Fecha de inscripción (Date o string ISO)
   *   - observations: Observaciones (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.studentAcademicDataId) {
      where.estudianteDatosAcademicosId = filters.studentAcademicDataId;
    }
    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.enrollmentType) {
      where.tipoInscripcion = filters.enrollmentType;
    }
    if (filters.enrollmentDate) {
      where.fechaInscripcion = filters.enrollmentDate;
    }
    if (filters.observations !== undefined) {
      // Permite búsqueda exacta de observaciones
      // Para búsqueda de texto parcial, usar el método search()
      where.observaciones = filters.observations;
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
    return ['observaciones'];
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
   * Delega la responsabilidad de mapeo a EnrollmentMapper
   * 
   * @param {Enrollment|Object} data - Entidad Enrollment o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return EnrollmentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a EnrollmentMapper
   * 
   * @param {Enrollment|Object} data - Entidad Enrollment o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return EnrollmentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'enrollments';
  }
}
