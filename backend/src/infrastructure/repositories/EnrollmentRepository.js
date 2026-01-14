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
   * Maneja todos los criterios de búsqueda: studentAcademicDataId, managementId, enrollmentType
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - studentAcademicDataId: ID de datos académicos del estudiante
   *   - managementId: ID de la gestión académica
   *   - enrollmentType: Tipo de inscripción (NUEVO, CONTINUIDAD, REINGRESO, etc.)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Criterios de búsqueda únicos (para findBy)
    if (filters.studentAcademicDataId) {
      where.estudianteDatosAcademicosId = filters.studentAcademicDataId;
    }
    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.enrollmentType) {
      where.tipoInscripcion = filters.enrollmentType;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['observaciones'];
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
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'enrollments';
  }
}
