import { IRepository } from './IRepository.js';

/**
 * Interfaz de Repositorio: IEvaluacionNotaRepository
 *
 * Celdas del cuaderno bimestral (`evaluaciones_notas`).
 * → BimesterEvaluationGrade / BimesterEvaluationGradeMapper / BimesterEvaluationGradeRepository
 *
 * DDL: database/01-schemas/13-evaluaciones.sql
 *
 * Operaciones de celda del cuaderno (upsert / soft-delete) consumidas por la
 * capa application. La validación y la orquestación viven en los casos de uso.
 */
export class IEvaluacionNotaRepository extends IRepository {
    /** @returns {Promise<{id:number, nota:number}|null>} */
    async buscarNotaCelda(evaluacionId, bimestreMatriculaId, options) {
        throw new Error('Method buscarNotaCelda() must be implemented');
    }

    /** @returns {Promise<{id:number, nota:number}>} */
    async upsertNotaCelda(params, options) {
        throw new Error('Method upsertNotaCelda() must be implemented');
    }

    /** @returns {Promise<void>} */
    async eliminarNotaCelda(evaluacionId, bimestreMatriculaId, usuarioId, options) {
        throw new Error('Method eliminarNotaCelda() must be implemented');
    }

    /** @returns {Promise<void>} */
    async softEliminarNotasPorEvaluacion(evaluacionId, usuarioId, options) {
        throw new Error('Method softEliminarNotasPorEvaluacion() must be implemented');
    }
}
