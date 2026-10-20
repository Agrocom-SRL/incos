import { Op } from 'sequelize';
import { EvaluacionNota as EvaluacionNotaModel } from '../database/models/evaluacion_nota.js';
import { BaseRepository } from './BaseRepository.js';
import { BimesterEvaluationGradeMapper } from '../mappers/BimesterEvaluationGradeMapper.js';
import { sequelize } from '../database/sequelize.js';

/**
 * @implements {IEvaluacionNotaRepository}
 */
export class BimesterEvaluationGradeRepository extends BaseRepository {
    getModel() {
        return EvaluacionNotaModel;
    }

    toEntity(model) {
        return BimesterEvaluationGradeMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.bimesterEvaluationIds &&
            Array.isArray(filters.bimesterEvaluationIds) &&
            filters.bimesterEvaluationIds.length > 0
        ) {
            where.evaluacionId = { [Op.in]: filters.bimesterEvaluationIds };
        } else if (filters.bimesterEvaluationId) {
            where.evaluacionId = filters.bimesterEvaluationId;
        }

        if (
            filters.subjectEnrollmentBimesterIds &&
            Array.isArray(filters.subjectEnrollmentBimesterIds) &&
            filters.subjectEnrollmentBimesterIds.length > 0
        ) {
            where.bimestreMatriculaId = { [Op.in]: filters.subjectEnrollmentBimesterIds };
        } else if (filters.subjectEnrollmentBimesterId) {
            where.bimestreMatriculaId = filters.subjectEnrollmentBimesterId;
        }

        if (filters.attempt !== undefined) {
            where.intento = filters.attempt;
        }
        if (filters.hasGrade === true) {
            where.nota = { [Op.ne]: null };
        }

        return where;
    }

    getSearchFields() {
        return [];
    }

    getDefaultSort() {
        return [['id', 'ASC']];
    }

    mapDataToModel(data, _userId = null) {
        return BimesterEvaluationGradeMapper.toModel(data);
    }

    mapDataToUpdate(data, _userId = null) {
        return BimesterEvaluationGradeMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'bimesterEvaluationGrades';
    }

    // ============================================
    // Celdas de nota del cuaderno (evaluaciones_notas): upsert / soft-delete.
    // La validación y la orquestación con otras tablas viven en la capa application.
    // ============================================

    /**
     * Busca la celda de nota activa (evaluación × bimestre_matricula).
     * @returns {Promise<{id:number, nota:number}|null>}
     */
    async buscarNotaCelda(evaluacionId, bimestreMatriculaId, { transaction } = {}) {
        const rows = await sequelize.query(
            `
            SELECT id, nota
            FROM evaluaciones_notas
            WHERE evaluacion_id = ?
              AND bimestre_matricula_id = ?
              AND deleted_at IS NULL
              AND activo = TRUE
            LIMIT 1
            `,
            {
                replacements: [evaluacionId, bimestreMatriculaId],
                type: sequelize.QueryTypes.SELECT,
                transaction,
            },
        );
        return rows[0] ?? null;
    }

    /**
     * Inserta o actualiza la nota de una celda del cuaderno.
     * @param {{ evaluacionId:number, bimestreMatriculaId:number, nota:number, usuarioId:number }} params
     * @returns {Promise<{id:number, nota:number}>}
     */
    async upsertNotaCelda({ evaluacionId, bimestreMatriculaId, nota, usuarioId }, { transaction } = {}) {
        const existente = await this.buscarNotaCelda(evaluacionId, bimestreMatriculaId, { transaction });
        if (existente?.id) {
            await sequelize.query(
                `
                UPDATE evaluaciones_notas
                SET nota = ?, updated_by = ?, updated_at = NOW(), activo = TRUE, deleted_at = NULL, deleted_by = NULL
                WHERE id = ?
                `,
                { replacements: [nota, usuarioId, existente.id], type: sequelize.QueryTypes.UPDATE, transaction },
            );
            const rows = await sequelize.query(
                'SELECT nota FROM evaluaciones_notas WHERE id = ? LIMIT 1',
                { replacements: [existente.id], type: sequelize.QueryTypes.SELECT, transaction },
            );
            return { id: Number(existente.id), nota: rows[0]?.nota ?? nota };
        }

        const insert = await sequelize.query(
            `
            INSERT INTO evaluaciones_notas (evaluacion_id, bimestre_matricula_id, nota, intento, activo, created_by, updated_by)
            VALUES (?, ?, ?, 1, TRUE, ?, ?)
            `,
            {
                replacements: [evaluacionId, bimestreMatriculaId, nota, usuarioId, usuarioId],
                type: sequelize.QueryTypes.INSERT,
                transaction,
            },
        );
        return { id: Number(insert), nota };
    }

    /** Soft-delete de una celda de nota. @returns {Promise<void>} */
    async eliminarNotaCelda(evaluacionId, bimestreMatriculaId, usuarioId, { transaction } = {}) {
        const existente = await this.buscarNotaCelda(evaluacionId, bimestreMatriculaId, { transaction });
        if (!existente?.id) return;
        await sequelize.query(
            `
            UPDATE evaluaciones_notas
            SET deleted_at = NOW(), deleted_by = ?, activo = FALSE, updated_by = ?, updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
            `,
            { replacements: [usuarioId, usuarioId, existente.id], type: sequelize.QueryTypes.UPDATE, transaction },
        );
    }

    /** Soft-delete de todas las notas de una evaluación. @returns {Promise<void>} */
    async softEliminarNotasPorEvaluacion(evaluacionId, usuarioId, { transaction } = {}) {
        await sequelize.query(
            `
            UPDATE evaluaciones_notas
            SET deleted_at = NOW(), deleted_by = ?, activo = FALSE, updated_by = ?, updated_at = NOW()
            WHERE evaluacion_id = ?
              AND deleted_at IS NULL
            `,
            { replacements: [usuarioId, usuarioId, evaluacionId], type: sequelize.QueryTypes.UPDATE, transaction },
        );
    }
}

export default BimesterEvaluationGradeRepository;
