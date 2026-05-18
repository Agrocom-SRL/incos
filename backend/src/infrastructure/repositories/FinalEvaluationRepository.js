import { Op } from 'sequelize';
import { IEvaluacionFinalRepository } from '../../domain/interfaces/repositories/IEvaluacionFinalRepository.js';
import { EvaluacionFinal as EvaluacionFinalModel } from '../database/models/evaluacion_final.js';
import { BaseRepository } from './BaseRepository.js';
import { FinalEvaluationMapper } from '../mappers/FinalEvaluationMapper.js';

/**
 * @implements {IEvaluacionFinalRepository}
 */
export class FinalEvaluationRepository extends BaseRepository {
    getModel() {
        return EvaluacionFinalModel;
    }

    toEntity(model) {
        return FinalEvaluationMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.subjectEnrollmentIds &&
            Array.isArray(filters.subjectEnrollmentIds) &&
            filters.subjectEnrollmentIds.length > 0
        ) {
            where.matriculaMateriaId = { [Op.in]: filters.subjectEnrollmentIds };
        } else if (filters.subjectEnrollmentId) {
            where.matriculaMateriaId = filters.subjectEnrollmentId;
        }

        if (
            filters.evaluationTypeIds &&
            Array.isArray(filters.evaluationTypeIds) &&
            filters.evaluationTypeIds.length > 0
        ) {
            where.tipoEvaluacionId = { [Op.in]: filters.evaluationTypeIds };
        } else if (filters.evaluationTypeId) {
            where.tipoEvaluacionId = filters.evaluationTypeId;
        }

        if (filters.gradesClosed !== undefined) {
            where.notasCerradas = filters.gradesClosed;
        }

        return where;
    }

    getSearchFields() {
        return ['nombreEvaluacion', 'descripcion', 'observaciones'];
    }

    getDefaultSort() {
        return [['fecha', 'DESC'], ['id', 'DESC']];
    }

    mapDataToModel(data, userId = null) {
        return FinalEvaluationMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return FinalEvaluationMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'finalEvaluations';
    }
}

export default FinalEvaluationRepository;
