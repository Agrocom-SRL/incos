import { Op } from 'sequelize';
import { IHistorialPrevioRepository } from '../../domain/interfaces/repositories/IHistorialPrevioRepository.js';
import { HistorialPrevio as HistorialPrevioModel } from '../database/models/historial_previo.js';
import { BaseRepository } from './BaseRepository.js';
import { PriorEnrollmentHistoryMapper } from '../mappers/PriorEnrollmentHistoryMapper.js';

/**
 * @implements {IHistorialPrevioRepository}
 */
export class PriorEnrollmentHistoryRepository extends BaseRepository {
    getModel() {
        return HistorialPrevioModel;
    }

    toEntity(model) {
        return PriorEnrollmentHistoryMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.enrollmentIds &&
            Array.isArray(filters.enrollmentIds) &&
            filters.enrollmentIds.length > 0
        ) {
            where.inscripcionId = { [Op.in]: filters.enrollmentIds };
        } else if (filters.enrollmentId) {
            where.inscripcionId = filters.enrollmentId;
        }

        if (
            filters.curriculumSubjectIds &&
            Array.isArray(filters.curriculumSubjectIds) &&
            filters.curriculumSubjectIds.length > 0
        ) {
            where.asignaturaPlanId = { [Op.in]: filters.curriculumSubjectIds };
        } else if (filters.curriculumSubjectId) {
            where.asignaturaPlanId = filters.curriculumSubjectId;
        }

        if (filters.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
            where.estado = { [Op.in]: filters.statuses };
        } else if (filters.status) {
            where.estado = filters.status;
        }

        if (filters.finalGrade !== undefined) {
            where.notaFinal = filters.finalGrade;
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
        return PriorEnrollmentHistoryMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return PriorEnrollmentHistoryMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'priorEnrollmentHistories';
    }
}

export default PriorEnrollmentHistoryRepository;
