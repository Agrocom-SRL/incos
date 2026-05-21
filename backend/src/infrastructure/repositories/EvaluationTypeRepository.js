import { Op } from 'sequelize';
import { ITipoEvaluacionRepository } from '../../domain/interfaces/repositories/ITipoEvaluacionRepository.js';
import { TipoEvaluacion as TipoEvaluacionModel } from '../database/models/tipo_evaluacion.js';
import { BaseRepository } from './BaseRepository.js';
import { EvaluationTypeMapper } from '../mappers/EvaluationTypeMapper.js';

/**
 * @implements {ITipoEvaluacionRepository}
 */
export class EvaluationTypeRepository extends BaseRepository {
    getModel() {
        return TipoEvaluacionModel;
    }

    toEntity(model) {
        return EvaluationTypeMapper.toEntity(model);
    }

    buildWhereClause(filters = {}) {
        const where = {};

        if (filters.code) {
            where.codigo = filters.code;
        }
        if (filters.name) {
            where.nombre = filters.name;
        }
        if (filters.scope) {
            where.ambito = filters.scope;
        }
        if (filters.scopes && Array.isArray(filters.scopes) && filters.scopes.length > 0) {
            where.ambito = { [Op.in]: filters.scopes };
        }
        if (filters.isRecovery !== undefined) {
            where.esRecuperatorio = filters.isRecovery;
        }

        return where;
    }

    getSearchFields() {
        return ['codigo', 'nombre', 'descripcion'];
    }

    getDefaultSort() {
        return [['codigo', 'ASC']];
    }

    mapDataToModel(data, userId = null) {
        return EvaluationTypeMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return EvaluationTypeMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'evaluationTypes';
    }
}

export default EvaluationTypeRepository;
