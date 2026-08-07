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
 * - findCurrentByAlternateAnchor(enrollmentId, planSubjectId, options) — ancla
 *   alterna (materia NO cursada: arrastre/choque horario/etc.), espejo de
 *   findCurrentBySubjectEnrollmentId.
 * - expireCurrentByAlternateAnchor(enrollmentId, planSubjectId, userId, options)
 *   — espejo de expireCurrentBySubjectEnrollmentId para la ancla alterna.
 */
export class IHistorialMatriculaRepository extends IRepository {
    async findCurrentBySubjectEnrollmentId(subjectEnrollmentId, _options = {}) {
        throw new Error('Method findCurrentBySubjectEnrollmentId must be implemented by subclass');
    }

    async findByLevelingId(levelingId, _options = {}) {
        throw new Error('Method findByLevelingId must be implemented by subclass');
    }

    async expireCurrentBySubjectEnrollmentId(
        subjectEnrollmentId,
        _userId = null,
        _options = {}
    ) {
        throw new Error('Method expireCurrentBySubjectEnrollmentId must be implemented by subclass');
    }

    async findCurrentByAlternateAnchor(enrollmentId, planSubjectId, _options = {}) {
        throw new Error('Method findCurrentByAlternateAnchor must be implemented by subclass');
    }

    async expireCurrentByAlternateAnchor(
        enrollmentId,
        planSubjectId,
        _userId = null,
        _options = {}
    ) {
        throw new Error('Method expireCurrentByAlternateAnchor must be implemented by subclass');
    }
}
