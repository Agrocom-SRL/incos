import { Op } from 'sequelize';
import { IEvaluacionRepository } from '../../domain/interfaces/repositories/IEvaluacionRepository.js';
import { Evaluacion as EvaluacionModel } from '../database/models/evaluacion.js';
import { BaseRepository } from './BaseRepository.js';
import { BimesterEvaluationMapper } from '../mappers/BimesterEvaluationMapper.js';

/**
 * @implements {IEvaluacionRepository}
 */
export class BimesterEvaluationRepository extends BaseRepository {
    getModel() {
        return EvaluacionModel;
    }

    toEntity(model) {
        return BimesterEvaluationMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.subjectEnrollmentBimesterIds &&
            Array.isArray(filters.subjectEnrollmentBimesterIds) &&
            filters.subjectEnrollmentBimesterIds.length > 0
        ) {
            where.bimestreMatriculaId = { [Op.in]: filters.subjectEnrollmentBimesterIds };
        } else if (filters.subjectEnrollmentBimesterId) {
            where.bimestreMatriculaId = filters.subjectEnrollmentBimesterId;
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

        if (filters.component) {
            where.componente = filters.component;
        }
        if (filters.gradesClosed !== undefined) {
            where.notasCerradas = filters.gradesClosed;
        }
        if (filters.attempt !== undefined) {
            where.intento = filters.attempt;
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
        return BimesterEvaluationMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return BimesterEvaluationMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'bimesterEvaluations';
    }
}

export default BimesterEvaluationRepository;
