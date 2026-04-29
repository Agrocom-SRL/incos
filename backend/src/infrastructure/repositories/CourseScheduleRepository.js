import { QueryTypes } from 'sequelize';
import { ICourseScheduleRepository } from '../../domain/interfaces/repositories/ICourseScheduleRepository.js';
import { CursoHorario as CursoHorarioModel } from '../database/models/curso_horario.js';
import { sequelize } from '../database/sequelize.js';
import { BaseRepository } from './BaseRepository.js';
import { CourseScheduleMapper } from '../mappers/CourseScheduleMapper.js';

/**
 * Implementación del repositorio de horarios de cursos usando Sequelize
 * Utiliza el patrón Template Method heredando de BaseRepository
 * 
 * Responsabilidades:
 * - Acceso a datos (consultas, persistencia)
 * - Delegar conversión ORM ↔ Entidad a CourseScheduleMapper
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja acceso a datos
 * - Dependency Inversion: Usa CourseScheduleMapper para conversiones (depende de abstracción)
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Implementación concreta de ICourseScheduleRepository
 * - Usa CourseScheduleMapper (Infrastructure) para adaptar Modelo ORM ↔ Entidad (Domain)
 * 
 * @implements {ICourseScheduleRepository}
 * 
 * Esta clase cumple con el contrato ICourseScheduleRepository:
 * - Hereda de BaseRepository que extiende IRepository (métodos base: findById, findBy, findAll, create, update, delete, search, count)
 * - La especialización está en buildWhereClause(), no en métodos adicionales
 * - Usa los métodos base de BaseRepository para todas las operaciones de búsqueda
 */
export class CourseScheduleRepository extends BaseRepository {
  getModel() {
    return CursoHorarioModel;
  }

  toEntity(model) {
    return CourseScheduleMapper.toEntity(model);
  }

  /**
   * Construye la cláusula WHERE para filtros específicos
   * Maneja todos los criterios de búsqueda de la entidad CourseSchedule
   * 
   * Este método permite usar findAll(), findBy(), search() y count() con filtros específicos
   * sin necesidad de crear métodos adicionales en el repositorio.
   * 
   * Ejemplos de uso:
   * - findAll({ courseId: 1 }) → Busca horarios de un curso
   * - findAll({ scheduleId: 2 }) → Busca cursos que usan un horario
   * - findBy({ courseId: 1, scheduleId: 2, classroomId: 3 }) → Busca horario específico
   * 
   * @param {Object} filters - Filtros de búsqueda
   *   - courseId: ID del curso
   *   - scheduleId: ID del horario
   *   - classroomId: ID del aula
   *   - sequenceOrder: Orden de secuencia
   * @returns {Object} Objeto WHERE para Sequelize
   */
  buildWhereClause(filters) {
    const where = {};

    // Mapeo: Dominio (camelCase inglés) → BD (snake_case español)
    if (filters.courseId) {
      where.cursoId = filters.courseId;
    }
    if (filters.scheduleId) {
      where.horarioId = filters.scheduleId;
    }
    if (filters.classroomId) {
      where.aulaId = filters.classroomId;
    }
    if (filters.sequenceOrder !== undefined) {
      where.ordenSecuencia = filters.sequenceOrder;
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
    return [];
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

  mapDataToModel(data, userId = null) {
    return CourseScheduleMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return CourseScheduleMapper.toModelForUpdate(data);
  }

  /**
   * Retorna el nombre de la colección en la respuesta JSON
   * 
   * @returns {string} Nombre de la colección para la respuesta JSON
   */
  getCollectionName() {
    return 'courseSchedules';
  }

  /**
   * Bloques de horario de un curso con datos de bloque y aula (solo lectura).
   * @param {number} cursoId
   * @returns {Promise<Array<Object>>}
   */
  async findBloquesByCursoIdForPresentation(cursoId) {
    const id = Number(cursoId);
    if (!Number.isFinite(id) || id < 1) return [];

    const sql = `
      SELECT
        b.id AS id,
        b.cursoId AS cursoId,
        b.ordenSecuencia AS ordenSecuencia,
        b.horarioId AS horarioId,
        b.horarioNombre AS horarioNombre,
        b.dia AS dia,
        b.horaInicio AS horaInicio,
        b.horaFin AS horaFin,
        b.turno AS turno,
        b.numeroBloque AS numeroBloque,
        b.aulaId AS aulaId,
        b.aulaCodigo AS aulaCodigo,
        b.aulaNombre AS aulaNombre
      FROM vista_base_curso_bloques_horario b
      WHERE b.cursoId = :cursoId
      ORDER BY b.ordenSecuencia ASC, b.id ASC
    `;

    return sequelize.query(sql, { replacements: { cursoId: id }, type: QueryTypes.SELECT });
  }
}
