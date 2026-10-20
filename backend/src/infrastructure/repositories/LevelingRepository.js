import { Op } from 'sequelize';
import { Nivelacion as NivelacionModel } from '../database/models/nivelacion.js';
import { BaseRepository } from './BaseRepository.js';
import { LevelingMapper } from '../mappers/LevelingMapper.js';

/**
 * @implements {INivelacionRepository}
 */
export class LevelingRepository extends BaseRepository {
    getModel() {
        return NivelacionModel;
    }

    toEntity(model) {
        return LevelingMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.subjectEnrollmentHistoryIds &&
            Array.isArray(filters.subjectEnrollmentHistoryIds) &&
            filters.subjectEnrollmentHistoryIds.length > 0
        ) {
            where.historialMatriculaId = { [Op.in]: filters.subjectEnrollmentHistoryIds };
        } else if (filters.subjectEnrollmentHistoryId) {
            where.historialMatriculaId = filters.subjectEnrollmentHistoryId;
        }

        if (
            filters.managementIds &&
            Array.isArray(filters.managementIds) &&
            filters.managementIds.length > 0
        ) {
            where.gestionId = { [Op.in]: filters.managementIds };
        } else if (filters.managementId) {
            where.gestionId = filters.managementId;
        }

        if (filters.evaluatorTeacherId) {
            where.docenteEvaluadorId = filters.evaluatorTeacherId;
        }
        if (filters.examDate !== undefined) {
            where.fechaExamen = filters.examDate;
        }
        if (filters.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
            where.estado = { [Op.in]: filters.statuses };
        } else if (filters.status) {
            where.estado = filters.status;
        }
        if (filters.passed !== undefined) {
            where.aprobado = filters.passed;
        }
        if (filters.levelingGrade !== undefined) {
            where.notaNivelacion = filters.levelingGrade;
        }

        return where;
    }

    getSearchFields() {
        return ['observaciones'];
    }

    getDefaultSort() {
        return [['fechaExamen', 'DESC'], ['id', 'DESC']];
    }

    mapDataToModel(data, _userId = null) {
        return LevelingMapper.toModel(data);
    }

    mapDataToUpdate(data, _userId = null) {
        return LevelingMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'levelings';
    }
}

export default LevelingRepository;
