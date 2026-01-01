import { ITurnoCursoRepository } from '../../domain/interfaces/repositories/ITurnoCursoRepository.js';
import { TurnoCurso as TurnoCursoModel } from '../database/models/turno_curso.js';
import { CourseShift } from '../../domain/entities/CourseShift.js';
import { BaseRepository } from './BaseRepository.js';

/**
 * Implementación del repositorio de turnos de cursos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * @implements {ITurnoCursoRepository}
 * 
 * Esta clase cumple con el contrato ITurnoCursoRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findAll, create, update, delete, search)
 * - Implementa findByAsignacionId() que es requerido por ITurnoCursoRepository
 */
export class CourseShiftRepository extends BaseRepository {
  /**
   * Obtiene el modelo Sequelize de turnos de cursos
   * @returns {Object} Modelo TurnoCurso
   */
  getModel() {
    return TurnoCursoModel;
  }

  /**
   * Convierte un modelo Sequelize a entidad de dominio
   * @param {Object} model
   * @returns {CourseShift|null}
   */
  toEntity(model) {
    if (!model) return null;
    return new CourseShift({
      id: model.id,
      assignmentId: model.asignacionId,
      shiftId: model.turnoId,
      weekDay: model.diaSemana,
      startTime: model.horaInicio,
      endTime: model.horaFin,
      classroom: model.aula,
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

    if (filters.assignmentId) {
      where.asignacionId = filters.assignmentId;
    }
    if (filters.shiftId) {
      where.turnoId = filters.shiftId;
    }
    if (filters.weekDay) {
      where.diaSemana = filters.weekDay;
    }

    return where;
  }

  /**
   * Retorna los campos que se usarán para búsqueda
   * @returns {string[]}
   */
  getSearchFields() {
    return ['aula'];
  }

  /**
   * Retorna el orden por defecto
   * @returns {Array}
   */
  getDefaultSort() {
    return [['diaSemana', 'ASC'], ['horaInicio', 'ASC']];
  }

  /**
   * Mapea datos de dominio a formato del modelo
   * @param {Object} data
   * @param {number} userId
   * @returns {Object}
   */
  mapDataToModel(data, userId = null) {
    return {
      asignacionId: data.assignmentId || null,
      turnoId: data.shiftId || null,
      diaSemana: data.weekDay,
      horaInicio: data.startTime,
      horaFin: data.endTime,
      aula: data.classroom,
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

    if (data.assignmentId !== undefined) {
      updateData.asignacionId = data.assignmentId || null;
    }
    if (data.shiftId !== undefined) {
      updateData.turnoId = data.shiftId || null;
    }
    if (data.weekDay !== undefined) {
      updateData.diaSemana = data.weekDay;
    }
    if (data.startTime !== undefined) {
      updateData.horaInicio = data.startTime;
    }
    if (data.endTime !== undefined) {
      updateData.horaFin = data.endTime;
    }
    if (data.classroom !== undefined) {
      updateData.aula = data.classroom;
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
    return 'courseShifts';
  }

  /**
   * Método específico: Buscar turnos por asignación
   * @param {number} asignacionId
   * @returns {Promise<CourseShift[]>}
   */
  async findByAsignacionId(asignacionId) {
    const models = await this.getModel().findAll({
      where: {
        asignacionId: asignacionId,
        activo: true,
        // paranoid: true automáticamente excluye deletedAt !== null
      },
      order: [['diaSemana', 'ASC'], ['horaInicio', 'ASC']],
    });
    return models.map((model) => this.toEntity(model));
  }
}

