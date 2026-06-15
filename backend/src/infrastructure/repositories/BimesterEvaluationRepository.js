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
            filters.teacherAssignmentIds &&
            Array.isArray(filters.teacherAssignmentIds) &&
            filters.teacherAssignmentIds.length > 0
        ) {
            where.asignacionDocenteId = { [Op.in]: filters.teacherAssignmentIds };
        } else if (filters.teacherAssignmentId) {
            where.asignacionDocenteId = filters.teacherAssignmentId;
        }

        if (
            filters.academicPeriodIds &&
            Array.isArray(filters.academicPeriodIds) &&
            filters.academicPeriodIds.length > 0
        ) {
            where.periodoAcademicoId = { [Op.in]: filters.academicPeriodIds };
        } else if (filters.academicPeriodId) {
            where.periodoAcademicoId = filters.academicPeriodId;
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

        return where;
    }

    getSearchFields() {
        return ['nombreEvaluacion', 'descripcion'];
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
