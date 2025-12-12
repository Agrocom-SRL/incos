import { IAsignacionDocenteRepository } from '../../domain/interfaces/repositories/IAsignacionDocenteRepository.js';
import { AsignacionDocente as AsignacionDocenteModel } from '../database/models/AsignacionDocente.js';
import { TeacherAssignment } from '../../domain/entities/TeacherAssignment.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de asignaciones de docentes usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
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
   * @param {Object} model
   * @returns {TeacherAssignment|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new TeacherAssignment({
      id: model.id,
      courseId: model.cursoId,
      managementId: model.gestionId,
      teacherId: model.docenteId,
      weeklyHours: model.cargaHorariaSemanal,
      state: model.estado,
      cancellationReason: model.motivoCancelacion,
      observations: model.observaciones,
      activo: model.activo,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
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
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      cursoId: data.courseId || null,
      gestionId: data.managementId || null,
      docenteId: data.teacherId || null,
      cargaHorariaSemanal: data.weeklyHours !== undefined ? data.weeklyHours : 0,
      estado: data.state || 'PROPUESTA',
      motivoCancelacion: data.cancellationReason || null,
      observaciones: data.observations || null,
    };
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToUpdate(data, userId = null) {
    const updateData = {};

    if (data.courseId !== undefined) {
      updateData.cursoId = data.courseId || null;
    }
    if (data.managementId !== undefined) {
      updateData.gestionId = data.managementId || null;
    }
    if (data.teacherId !== undefined) {
      updateData.docenteId = data.teacherId || null;
    }
    if (data.weeklyHours !== undefined) {
      updateData.cargaHorariaSemanal = data.weeklyHours;
    }
    if (data.state !== undefined) {
      updateData.estado = data.state;
    }
    if (data.cancellationReason !== undefined) {
      updateData.motivoCancelacion = data.cancellationReason || null;
    }
    if (data.observations !== undefined) {
      updateData.observaciones = data.observations || null;
    }
    if (data.activo !== undefined) {
      updateData.activo = data.activo;
    }

    return updateData;
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
   * @param {number} docenteId
   * @returns {Promise<TeacherAssignment[]>}
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
    return models.map((model) => this.toEntity(model));
  }

  /**
   * Método específico: Buscar asignaciones por gestión
   * @param {number} gestionId
   * @returns {Promise<TeacherAssignment[]>}
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
    return models.map((model) => this.toEntity(model));
  }
}

