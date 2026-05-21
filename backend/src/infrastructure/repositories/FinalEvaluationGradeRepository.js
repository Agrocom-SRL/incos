import { Op } from 'sequelize';
import { IEvaluacionFinalNotaRepository } from '../../domain/interfaces/repositories/IEvaluacionFinalNotaRepository.js';
import { EvaluacionFinalNota as EvaluacionFinalNotaModel } from '../database/models/evaluacion_final_nota.js';
import { BaseRepository } from './BaseRepository.js';
import { FinalEvaluationGradeMapper } from '../mappers/FinalEvaluationGradeMapper.js';

/**
 * @implements {IEvaluacionFinalNotaRepository}
 */
export class FinalEvaluationGradeRepository extends BaseRepository {
    getModel() {
        return EvaluacionFinalNotaModel;
    }

    toEntity(model) {
        return FinalEvaluationGradeMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.finalEvaluationIds &&
            Array.isArray(filters.finalEvaluationIds) &&
            filters.finalEvaluationIds.length > 0
        ) {
            where.evaluacionFinalId = { [Op.in]: filters.finalEvaluationIds };
        } else if (filters.finalEvaluationId) {
            where.evaluacionFinalId = filters.finalEvaluationId;
        }

        if (
            filters.subjectEnrollmentIds &&
            Array.isArray(filters.subjectEnrollmentIds) &&
            filters.subjectEnrollmentIds.length > 0
        ) {
            where.matriculaMateriaId = { [Op.in]: filters.subjectEnrollmentIds };
        } else if (filters.subjectEnrollmentId) {
            where.matriculaMateriaId = filters.subjectEnrollmentId;
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

    mapDataToModel(data, userId = null) {
        return FinalEvaluationGradeMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return FinalEvaluationGradeMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'finalEvaluationGrades';
    }
}

export default FinalEvaluationGradeRepository;
