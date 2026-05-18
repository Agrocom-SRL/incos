import { Op } from 'sequelize';
import { IAsistenciaRepository } from '../../domain/interfaces/repositories/IAsistenciaRepository.js';
import { Asistencia as AsistenciaModel } from '../database/models/asistencia.js';
import { BaseRepository } from './BaseRepository.js';
import { AttendanceMapper } from '../mappers/AttendanceMapper.js';

/**
 * @implements {IAsistenciaRepository}
 */
export class AttendanceRepository extends BaseRepository {
    getModel() {
        return AsistenciaModel;
    }

    toEntity(model) {
        return AttendanceMapper.toEntity(model);
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

        if (filters.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
            where.estado = { [Op.in]: filters.statuses };
        } else if (filters.status) {
            where.estado = filters.status;
        }

        if (filters.registeredBy !== undefined) {
            where.registradoPor = filters.registeredBy;
        }

        return where;
    }

    getSearchFields() {
        return ['observaciones'];
    }

    getDefaultSort() {
        return [['fechaClase', 'DESC'], ['horaClase', 'ASC'], ['id', 'DESC']];
    }

    mapDataToModel(data, userId = null) {
        return AttendanceMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return AttendanceMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'attendances';
    }
}

export default AttendanceRepository;
