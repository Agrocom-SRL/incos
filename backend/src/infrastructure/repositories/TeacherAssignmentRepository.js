import { IAsignacionDocenteRepository } from '../../domain/interfaces/repositories/IAsignacionDocenteRepository.js';
import { AsignacionDocente as AsignacionDocenteModel } from '../database/models/asignacion_docente.js';
import { BaseRepository } from './BaseRepository.js';
import { TeacherAssignmentMapper } from '../mappers/TeacherAssignmentMapper.js';

/**
 * Implementación del repositorio de asignaciones de docentes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a TeacherAssignmentMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa TeacherAssignmentMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de IAsignacionDocenteRepository
 * - Usa TeacherAssignmentMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {IAsignacionDocenteRepository}
 * 
 * Esta clase cumple con el contrato IAsignacionDocenteRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 */
export class TeacherAssignmentRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de asignaciones de docentes
   * @returns {Object} Modelo AsignacionDocente
   */
  getModel() {
    return AsignacionDocenteModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * Delega la responsabilidad de mapeo a TeacherAssignmentMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {TeacherAssignment|null} Entidad de dominio
   */
  toEntity(model) {
    return TeacherAssignmentMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * @param {Object} filters
   * @returns {Object}
   */
  buildWhereClause(filters) {
    const where = {};

    if (filters.teacherId) {
      where.docenteId = filters.teacherId;
    }
    if (filters.managementPlanId) {
      where.gestionPlanId = filters.managementPlanId;
    }
    if (filters.courseId) {
      where.cursoId = filters.courseId;
    }
    if (filters.active !== undefined) {
      where.vigente = filters.active;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['motivo'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() { return []; }

  /**
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a TeacherAssignmentMapper
   * 
   * @param {TeacherAssignment|Object} data - Entidad TeacherAssignment o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return TeacherAssignmentMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a TeacherAssignmentMapper
   * 
   * @param {TeacherAssignment|Object} data - Entidad TeacherAssignment o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return TeacherAssignmentMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta
   * @returns {string}
   */
  getCollectionName() {
    return 'teacherAssignments';
  }

  // NOTA: Los métodos específicos han sido eliminados. Ahora se usan los métodos base de IRepository:
  // - findBy({ teacherId }) para buscar por docente
  // - findBy({ managementPlanId }) para buscar por plan habilitado
  // - findAll({ teacherId, managementPlanId, courseId, active }) para búsquedas con filtros
}

