import { Op } from 'sequelize';
import { IClaseNoDictadaRepository } from '../../domain/interfaces/repositories/IClaseNoDictadaRepository.js';
import { ClaseNoDictada as ClaseNoDictadaModel } from '../database/models/clase_no_dictada.js';
import { BaseRepository } from './BaseRepository.js';
import { MissedClassMapper } from '../mappers/MissedClassMapper.js';

/**
 * @implements {IClaseNoDictadaRepository}
 */
export class MissedClassRepository extends BaseRepository {
    getModel() {
        return ClaseNoDictadaModel;
    }

    toEntity(model) {
        return MissedClassMapper.toEntity(model);
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

        if (filters.classDate !== undefined) {
            where.fechaClase = filters.classDate;
        } else {
            const dateRange = {};
            if (filters.classDateFrom) {
                dateRange[Op.gte] = filters.classDateFrom;
            }
            if (filters.classDateTo) {
                dateRange[Op.lte] = filters.classDateTo;
            }
            if (Object.keys(dateRange).length > 0) {
                where.fechaClase = dateRange;
            }
        }

        if (filters.reason) {
            where.motivo = filters.reason;
        }
        if (filters.reasons && Array.isArray(filters.reasons) && filters.reasons.length > 0) {
            where.motivo = { [Op.in]: filters.reasons };
        }

        return where;
    }

    getSearchFields() {
        return ['descripcionMotivo'];
    }

    getDefaultSort() {
        return [['fechaClase', 'DESC'], ['id', 'DESC']];
    }

    mapDataToModel(data, userId = null) {
        return MissedClassMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return MissedClassMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'missedClasses';
    }
}

export default MissedClassRepository;
