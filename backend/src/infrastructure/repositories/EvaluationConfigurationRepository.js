import { Op } from 'sequelize';
import { IConfiguracionEvaluacionRepository } from '../../domain/interfaces/repositories/IConfiguracionEvaluacionRepository.js';
import { ConfiguracionEvaluacion as ConfiguracionEvaluacionModel } from '../database/models/configuracion_evaluacion.js';
import { BaseRepository } from './BaseRepository.js';
import { EvaluationConfigurationMapper } from '../mappers/EvaluationConfigurationMapper.js';

/**
 * @implements {IConfiguracionEvaluacionRepository}
 */
export class EvaluationConfigurationRepository extends BaseRepository {
    getModel() {
        return ConfiguracionEvaluacionModel;
    }

    toEntity(model) {
        return EvaluationConfigurationMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.managementIds &&
            Array.isArray(filters.managementIds) &&
            filters.managementIds.length > 0
        ) {
            where.gestionId = { [Op.in]: filters.managementIds };
        } else if (filters.managementId) {
            where.gestionId = filters.managementId;
        }

        if (filters.theoryQuota !== undefined) {
            where.cuotaTeorico = filters.theoryQuota;
        }
        if (filters.practiceQuota !== undefined) {
            where.cuotaPractico = filters.practiceQuota;
        }

        return where;
    }

    getSearchFields() {
        return ['descripcion'];
    }

    getDefaultSort() {
        return [['gestionId', 'DESC'], ['id', 'DESC']];
    }

    mapDataToModel(data, userId = null) {
        return EvaluationConfigurationMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return EvaluationConfigurationMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'evaluationConfigurations';
    }
}

export default EvaluationConfigurationRepository;
