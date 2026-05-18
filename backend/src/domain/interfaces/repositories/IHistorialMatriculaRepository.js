import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IHistorialMatriculaRepository
 *
 * Convención de capas:
 * IHistorialMatriculaRepository → models/historial_matricula.js (`historial_matricula`)
 * → SubjectEnrollmentHistory / SubjectEnrollmentHistoryMapper / SubjectEnrollmentHistoryRepository
 *
 * DDL: database/01-schemas/16-nivelaciones.sql
 *
 * Métodos específicos:
 * - findCurrentBySubjectEnrollmentId(subjectEnrollmentId, options)
 * - findByLevelingId(levelingId, options)
 * - expireCurrentBySubjectEnrollmentId(subjectEnrollmentId, userId, options)
 */
export class IHistorialMatriculaRepository extends IRepository {
    async findCurrentBySubjectEnrollmentId(subjectEnrollmentId, options = {}) {
        throw new Error('Method findCurrentBySubjectEnrollmentId must be implemented by subclass');
    }

    async findByLevelingId(levelingId, options = {}) {
        throw new Error('Method findByLevelingId must be implemented by subclass');
    }

    async expireCurrentBySubjectEnrollmentId(
        subjectEnrollmentId,
        userId = null,
        options = {}
    ) {
        throw new Error('Method expireCurrentBySubjectEnrollmentId must be implemented by subclass');
    }
}
