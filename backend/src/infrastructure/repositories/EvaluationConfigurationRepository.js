import { Op } from 'sequelize';
import { IConfiguracionEvaluacionRepository } from '../../domain/interfaces/repositories/IConfiguracionEvaluacionRepository.js';
import { ConfiguracionEvaluacion as ConfiguracionEvaluacionModel } from '../database/models/configuracion_evaluacion.js';
import { sequelize } from '../database/sequelize.js';
import { BaseRepository } from './BaseRepository.js';
import { EvaluationConfigurationMapper } from '../mappers/EvaluationConfigurationMapper.js';
import { CLAVE_POLITICA_INSTITUCIONAL } from '../../application/utils/politicaInstitucionalClaves.js';
import { serializePoliticaValor } from '../../application/utils/politicaInstitucionalPayload.js';

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

        if (filters.key) {
            where.clave = filters.key;
        }
        if (filters.isCurrent !== undefined) {
            where.vigente = filters.isCurrent;
        }

        return where;
    }

    getSearchFields() {
        return ['clave', 'descripcion'];
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
     * Política institucional vigente para una gestión (con auditoría).
     * @param {number} gestionId
     * @returns {Promise<Object|null>}
     */
    async findActiveRowByGestionId(gestionId) {
        const rows = await sequelize.query(
            `
      SELECT
        ce.id,
        ce.gestion_id,
        ce.clave,
        ce.valor,
        ce.tipo,
        ce.vigente,
        ce.descripcion,
        ce.updated_at,
        ce.updated_by,
        u.username AS updated_by_username
      FROM configuracion_evaluacion ce
      LEFT JOIN usuarios u ON u.id = ce.updated_by AND u.deleted_at IS NULL
      WHERE ce.gestion_id = ?
        AND ce.clave = ?
        AND ce.vigente = TRUE
        AND ce.activo = TRUE
        AND ce.deleted_at IS NULL
      ORDER BY ce.id DESC
      LIMIT 1
      `,
            {
                replacements: [gestionId, CLAVE_POLITICA_INSTITUCIONAL],
                type: sequelize.QueryTypes.SELECT,
            }
        );
        return rows[0] ?? null;
    }

    /**
     * Crea o actualiza la política institucional vigente de una gestión.
     * @param {number} gestionId
     * @param {Object} documento - objeto política (se serializa a JSON)
     * @param {number|null} userId
     */
    async upsertPoliticaVigente(gestionId, documento, userId = null) {
        const valor = serializePoliticaValor(documento);
        const existente = await this.findActiveRowByGestionId(gestionId);

        await sequelize.query(
            `
      UPDATE configuracion_evaluacion
      SET vigente = FALSE, updated_at = NOW(), updated_by = ?
      WHERE gestion_id = ? AND clave = ? AND vigente = TRUE AND deleted_at IS NULL
      `,
            {
                replacements: [userId, gestionId, CLAVE_POLITICA_INSTITUCIONAL],
                type: sequelize.QueryTypes.UPDATE,
            }
        );

        if (existente?.id) {
            await this.update(
                existente.id,
                {
                    value: valor,
                    valueType: 'JSON',
                    isCurrent: true,
                    description:
                        existente.descripcion ??
                        'Política institucional de evaluación y notas',
                },
                userId
            );
            return existente.id;
        }

        const created = await this.create(
            {
                managementId: gestionId,
                key: CLAVE_POLITICA_INSTITUCIONAL,
                value: valor,
                valueType: 'JSON',
                isCurrent: true,
                description: 'Política institucional de evaluación y notas',
            },
            userId
        );
        return created?.id;
    }
}

export default EvaluationConfigurationRepository;
