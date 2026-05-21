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
            filters.teacherAssignmentIds &&
            Array.isArray(filters.teacherAssignmentIds) &&
            filters.teacherAssignmentIds.length > 0
        ) {
            where.asignacionDocenteId = { [Op.in]: filters.teacherAssignmentIds };
        } else if (filters.teacherAssignmentId) {
            where.asignacionDocenteId = filters.teacherAssignmentId;
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
        return ['nombreEvaluacion', 'descripcion'];
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
