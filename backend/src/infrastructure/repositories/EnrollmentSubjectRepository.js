import { IEnrollmentSubjectRepository } from '../../domain/interfaces/repositories/IEnrollmentSubjectRepository.js';
import { InscripcionMateria as InscripcionMateriaModel } from '../database/models/inscripcion_materia.js';
import { BaseRepository } from './BaseRepository.js';
import { EnrollmentSubjectMapper } from '../mappers/EnrollmentSubjectMapper.js';

/**
 * Implementación del repositorio de materias inscritas usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a EnrollmentSubjectMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa EnrollmentSubjectMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IEnrollmentSubjectRepository
 * - Usa EnrollmentSubjectMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IEnrollmentSubjectRepository}
 * 
 * Esta clase cumple con el contrato IEnrollmentSubjectRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 */
export class EnrollmentSubjectRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de inscripciones de materias
   * @returns {Object} Modelo InscripcionMateria
   */
  getModel() {
    return InscripcionMateriaModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a EnrollmentSubjectMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {EnrollmentSubject|null} Entidad de dominio
   */
  toEntity(model) {
    return EnrollmentSubjectMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda: enrollmentId, teacherAssignmentId, status
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - enrollmentId: ID de la inscripción
   *   - teacherAssignmentId: ID de la asignación docente
   *   - status: Estado de la materia (INSCRITO, CURSANDO, APROBADO, etc.)
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Criterios de búsqueda únicos (para findBy)
    if (filters.enrollmentId) {
      where.inscripcionId = filters.enrollmentId;
    }
    if (filters.teacherAssignmentId) {
      where.asignacionDocenteId = filters.teacherAssignmentId;
    }
    if (filters.status) {
      where.estado = filters.status;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['observaciones', 'observacionesDocente'];
  }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a EnrollmentSubjectMapper
   * 
   * @param {EnrollmentSubject|Object} data - Entidad EnrollmentSubject o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return EnrollmentSubjectMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a EnrollmentSubjectMapper
   * 
   * @param {EnrollmentSubject|Object} data - Entidad EnrollmentSubject o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return EnrollmentSubjectMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'enrollmentSubjects';
  }
}
