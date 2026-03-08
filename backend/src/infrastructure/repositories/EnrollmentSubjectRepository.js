import { Op } from 'sequelize';
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
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
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
   * Maneja todos los criterios de búsqueda de la entidad EnrollmentSubject
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ enrollmentId: 1 }) → Busca materias inscritas de una inscripción
   * - findAll({ status: 'APROBADO' }) → Busca materias aprobadas
   * - findBy({ enrollmentId: 1, teacherAssignmentId: 2 }) → Busca materia específica
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - enrollmentId: ID de la inscripción
   *   - teacherAssignmentId: ID de la asignación docente
   *   - finalGrade: Nota final (0-100)
   *   - definitiveGrade: Nota definitiva (0-100)
   *   - status: Estado de la materia (INSCRITO, CURSANDO, APROBADO, REPROBADO, etc.)
   *   - observations: Observaciones (búsqueda exacta, para búsqueda de texto usar search())
   *   - teacherObservations: Observaciones del docente (búsqueda exacta, para búsqueda de texto usar search())
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.enrollmentIds && Array.isArray(filters.enrollmentIds) && filters.enrollmentIds.length > 0) {
      where.inscripcionId = { [Op.in]: filters.enrollmentIds };
    } else if (filters.enrollmentId) {
      where.inscripcionId = filters.enrollmentId;
    }
    if (filters.teacherAssignmentId) {
      where.asignacionDocenteId = filters.teacherAssignmentId;
    }
    if (filters.finalGrade !== undefined) {
      where.notaFinal = filters.finalGrade;
    }
    if (filters.definitiveGrade !== undefined) {
      where.notaDefinitiva = filters.definitiveGrade;
    }
    if (filters.status) {
      where.estado = filters.status;
    }
    if (filters.observations !== undefined) {
      where.observaciones = filters.observations;
    }
    if (filters.teacherObservations !== undefined) {
      where.observacionesDocente = filters.teacherObservations;
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
    return ['observaciones', 'observacionesDocente'];
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
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'enrollmentSubjects';
  }
}
