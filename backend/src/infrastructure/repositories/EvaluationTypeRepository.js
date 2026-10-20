import { TipoEvaluacion as TipoEvaluacionModel } from '../database/models/tipo_evaluacion.js';
import { Evaluacion as EvaluacionModel } from '../database/models/evaluacion.js';
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

    mapDataToModel(data, _userId = null) {
        return EvaluationTypeMapper.toModel(data);
    }

    mapDataToUpdate(data, _userId = null) {
        return EvaluationTypeMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'evaluationTypes';
    }

    /**
     * Cuenta cuántas evaluaciones (columnas del cuaderno) usan un tipo de
     * evaluación dado. Dato informativo para la ficha del catálogo, sin
     * necesidad de una vista SQL (conteo simple sobre `evaluaciones`).
     *
     * @param {number} tipoEvaluacionId - ID del tipo de evaluación
     * @returns {Promise<number>} Cantidad de evaluaciones asociadas
     */
    async contarPorTipoEvaluacion(tipoEvaluacionId) {
        if (tipoEvaluacionId === undefined || tipoEvaluacionId === null) return 0;
        return EvaluacionModel.count({ where: { tipoEvaluacionId } });
    }
}

export default EvaluationTypeRepository;
