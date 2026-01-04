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
 * - Implementa findByDocenteId() y findByGestionId() que son requeridos por IAsignacionDocenteRepository
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
    if (filters.managementId) {
      where.gestionId = filters.managementId;
    }
    if (filters.courseId) {
      where.cursoId = filters.courseId;
    }
    if (filters.state) {
      where.estado = filters.state;
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
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['gestionId', 'DESC'], ['cursoId', 'ASC']];
  }

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

  /**
   * Método específico: Buscar asignaciones por docente
   * 
   * @param {number} docenteId - ID del docente
   * @returns {Promise<TeacherAssignment[]>} Array de entidades TeacherAssignment
   */
  async findByDocenteId(docenteId) {
    const models = await this.getModel().findAll({
      where: {
        docenteId: docenteId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['gestionId', 'DESC'], ['cursoId', 'ASC']],
    });
    return TeacherAssignmentMapper.toEntityList(models);
  }

  /**
   * Método específico: Buscar asignaciones por gestión
   * 
   * @param {number} gestionId - ID de la gestión
   * @returns {Promise<TeacherAssignment[]>} Array de entidades TeacherAssignment
   */
  async findByGestionId(gestionId) {
    const models = await this.getModel().findAll({
      where: {
        gestionId: gestionId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['cursoId', 'ASC']],
    });
    return TeacherAssignmentMapper.toEntityList(models);
  }
}

