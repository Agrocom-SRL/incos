import { ICourseScheduleRepository } from '../../domain/interfaces/repositories/ICourseScheduleRepository.js';
import { CursoHorario as CursoHorarioModel } from '../database/models/curso_horario.js';
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
 */
export class CourseScheduleRepository extends BaseRepository {
  getModel() {
    return CursoHorarioModel;
  }

  toEntity(model) {
    return CourseScheduleMapper.toEntity(model);
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.courseId) {
      where.cursoId = filters.courseId;
    }
    if (filters.scheduleId) {
      where.horarioId = filters.scheduleId;
    }
    if (filters.classroomId) {
      where.aulaId = filters.classroomId;
    }

    return where;
  }

  getSearchFields() {
    return [];
  }

  getDefaultSort() {
    return [['cursoId', 'ASC'], ['ordenSecuencia', 'ASC']];
  }

  mapDataToModel(data, userId = null) {
    return CourseScheduleMapper.toModel(data);
  }

  mapDataToUpdate(data, userId = null) {
    return CourseScheduleMapper.toModelForUpdate(data);
  }

  getCollectionName() {
    return 'courseSchedules';
  }
}
