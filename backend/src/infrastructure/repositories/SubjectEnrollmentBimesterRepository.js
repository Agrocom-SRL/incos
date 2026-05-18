import { Op } from 'sequelize';
import { IBimestreMatriculaRepository } from '../../domain/interfaces/repositories/IBimestreMatriculaRepository.js';
import { BimestreMatricula as BimestreMatriculaModel } from '../database/models/bimestre_matricula.js';
import { BaseRepository } from './BaseRepository.js';
import { SubjectEnrollmentBimesterMapper } from '../mappers/SubjectEnrollmentBimesterMapper.js';

/**
 * @implements {IBimestreMatriculaRepository}
 */
export class SubjectEnrollmentBimesterRepository extends BaseRepository {
    getModel() {
        return BimestreMatriculaModel;
    }

    toEntity(model) {
        return SubjectEnrollmentBimesterMapper.toEntity(model);
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

        if (filters.bimester !== undefined) {
            where.bimestre = filters.bimester;
        }
        if (filters.bimesters && Array.isArray(filters.bimesters) && filters.bimesters.length > 0) {
            where.bimestre = { [Op.in]: filters.bimesters };
        }

        if (filters.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
            where.estado = { [Op.in]: filters.statuses };
        } else if (filters.status) {
            where.estado = filters.status;
        }

        if (filters.closedBy !== undefined) {
            where.cerradoPor = filters.closedBy;
        }

        return where;
    }

    getSearchFields() {
        return ['observaciones'];
    }

    getDefaultSort() {
        return [['bimestre', 'ASC'], ['id', 'ASC']];
    }

    mapDataToModel(data, userId = null) {
        return SubjectEnrollmentBimesterMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return SubjectEnrollmentBimesterMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'subjectEnrollmentBimesters';
    }
}

export default SubjectEnrollmentBimesterRepository;
