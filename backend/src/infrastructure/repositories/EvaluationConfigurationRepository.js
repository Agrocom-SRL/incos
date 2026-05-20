import { Op } from 'sequelize';
import { IConfiguracionEvaluacionRepository } from '../../domain/interfaces/repositories/IConfiguracionEvaluacionRepository.js';
import { ConfiguracionEvaluacion as ConfiguracionEvaluacionModel } from '../database/models/configuracion_evaluacion.js';
import { sequelize } from '../database/sequelize.js';
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

    /**
     * Fila activa de configuracion_evaluacion para una gestión (con auditoría).
     * @param {number} gestionId
     * @returns {Promise<Object|null>}
     */
    async findActiveRowByGestionId(gestionId) {
        const rows = await sequelize.query(
            `
      SELECT
        ce.id,
        ce.gestion_id,
        ce.cuota_teorico,
        ce.cuota_practico,
        ce.descripcion,
        ce.updated_at,
        ce.updated_by,
        u.username AS updated_by_username
      FROM configuracion_evaluacion ce
      LEFT JOIN usuarios u ON u.id = ce.updated_by AND u.deleted_at IS NULL
      WHERE ce.gestion_id = ?
        AND ce.activo = TRUE
        AND ce.deleted_at IS NULL
      ORDER BY ce.id DESC
      LIMIT 1
      `,
            { replacements: [gestionId], type: sequelize.QueryTypes.SELECT }
        );
        return rows[0] ?? null;
    }
}

export default EvaluationConfigurationRepository;
