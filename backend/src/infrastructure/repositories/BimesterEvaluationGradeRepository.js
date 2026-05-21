import { Op } from 'sequelize';
import { IEvaluacionNotaRepository } from '../../domain/interfaces/repositories/IEvaluacionNotaRepository.js';
import { EvaluacionNota as EvaluacionNotaModel } from '../database/models/evaluacion_nota.js';
import { BaseRepository } from './BaseRepository.js';
import { BimesterEvaluationGradeMapper } from '../mappers/BimesterEvaluationGradeMapper.js';

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

    mapDataToModel(data, userId = null) {
        return BimesterEvaluationGradeMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return BimesterEvaluationGradeMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'bimesterEvaluationGrades';
    }
}

export default BimesterEvaluationGradeRepository;
