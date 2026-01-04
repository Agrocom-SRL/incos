import { ITurnoCursoRepository } from '../../domain/interfaces/repositories/ITurnoCursoRepository.js';
import { TurnoCurso as TurnoCursoModel } from '../database/models/turno_curso.js';
import { BaseRepository } from './BaseRepository.js';
import { CourseShiftMapper } from '../mappers/CourseShiftMapper.js';

/**
 * Implementación del repositorio de turnos de cursos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CourseShiftMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CourseShiftMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ITurnoCursoRepository
 * - Usa CourseShiftMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
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
   * Delega la responsabilidad de mapeo a CourseShiftMapper
   * 
   * @param {Object} model - Modelo Sequelize
   * @returns {CourseShift|null} Entidad de dominio
   */
  toEntity(model) {
    return CourseShiftMapper.toEntity(model);
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
   * Mapea datos de dominio a formato del modelo Sequelize (para creación)
   * Delega la responsabilidad de mapeo a CourseShiftMapper
   * 
   * @param {CourseShift|Object} data - Entidad CourseShift o objeto con datos de dominio
   * @param {number} userId - ID del usuario que crea (usado por BaseRepository para createdBy)
   * @returns {Object} Objeto con formato del modelo Sequelize
   */
  mapDataToModel(data, userId = null) {
    return CourseShiftMapper.toModel(data);
  }

  /**
   * Mapea datos de actualización de dominio a formato del modelo Sequelize (para actualización)
   * Delega la responsabilidad de mapeo a CourseShiftMapper
   * 
   * @param {CourseShift|Object} data - Entidad CourseShift o objeto con datos de dominio
   * @param {number} userId - ID del usuario que actualiza (usado por BaseRepository para updatedBy)
   * @returns {Object} Objeto con formato del modelo Sequelize (solo campos definidos)
   */
  mapDataToUpdate(data, userId = null) {
    return CourseShiftMapper.toModelForUpdate(data);
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
   * 
   * @param {number} asignacionId - ID de la asignación docente
   * @returns {Promise<CourseShift[]>} Array de entidades CourseShift
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
    return CourseShiftMapper.toEntityList(models);
  }
}

