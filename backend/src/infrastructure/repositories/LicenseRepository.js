import { Op } from 'sequelize';
import { ILicenciaRepository } from '../../domain/interfaces/repositories/ILicenciaRepository.js';
import { Licencia as LicenciaModel } from '../database/models/licencia.js';
import { BaseRepository } from './BaseRepository.js';
import { LicenseMapper } from '../mappers/LicenseMapper.js';

/**
 * Implementación del repositorio de licencias (`licencias`).
 *
 * @implements {ILicenciaRepository}
 */
export class LicenseRepository extends BaseRepository {
    getModel() {
        return LicenciaModel;
    }

    toEntity(model) {
        return LicenseMapper.toEntity(model);
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

        if (filters.states && Array.isArray(filters.states) && filters.states.length > 0) {
            where.estado = { [Op.in]: filters.states };
        } else if (filters.state) {
            where.estado = filters.state;
        }

        if (filters.requestDate !== undefined) {
            where.fechaSolicitud = filters.requestDate;
        }
        if (filters.startDate !== undefined) {
            where.fechaInicio = filters.startDate;
        }
        if (filters.endDate !== undefined) {
            where.fechaFin = filters.endDate;
        }
        if (filters.totalDays !== undefined) {
            where.totalDias = filters.totalDays;
        }
        if (filters.reason) {
            where.motivo = filters.reason;
        }
        if (filters.reasonDetail !== undefined) {
            where.detalleMotivo = filters.reasonDetail;
        }
        if (filters.rejectionReason !== undefined) {
            where.motivoRechazo = filters.rejectionReason;
        }
        if (filters.decisionObservations !== undefined) {
            where.observacionesDecision = filters.decisionObservations;
        }

        return where;
    }

    getSearchFields() {
        return ['detalleMotivo', 'observacionesDecision', 'motivoRechazo'];
    }

    getDefaultSort() {
        return [['fechaSolicitud', 'DESC'], ['id', 'DESC']];
    }

    mapDataToModel(data, userId = null) {
        return LicenseMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return LicenseMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'licenses';
    }
}

export default LicenseRepository;
