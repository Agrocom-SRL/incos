import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: ICourseScheduleRepository
 * Define el contrato que debe cumplir el repositorio de horarios de cursos
 * 
 * NOTA: Solo extiende IRepository sin métodos adicionales.
 * La especialización está en la implementación (buildWhereClause), no en la interfaz.
 * 
 * Métodos heredados de IRepository:
 * - findById(id)
 * - findBy(criteria, options)
 * - findAll(filters, page, limit)
 * - create(data, userId)
 * - update(id, data, userId)
 * - delete(id, userId)
 * - search(searchTerm, options)
 * - count(filters)
 */
export class ICourseScheduleRepository extends IRepository {
  async hasClassroomConflict({ scheduleId, classroomId, excludeCourseScheduleId = null }) {
    throw new Error('Method hasClassroomConflict() must be implemented');
  }

  async findClassroomConflict({ scheduleId, classroomId, excludeCourseScheduleId = null }) {
    throw new Error('Method findClassroomConflict() must be implemented');
  }
}
