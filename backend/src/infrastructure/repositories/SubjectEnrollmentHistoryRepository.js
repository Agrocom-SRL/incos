import { Op } from 'sequelize';
import { IHistorialMatriculaRepository } from '../../domain/interfaces/repositories/IHistorialMatriculaRepository.js';
import { HistorialMatricula as HistorialMatriculaModel } from '../database/models/historial_matricula.js';
import { BaseRepository } from './BaseRepository.js';
import { SubjectEnrollmentHistoryMapper } from '../mappers/SubjectEnrollmentHistoryMapper.js';

/**
 * Implementación del repositorio de historial de matrícula usando Sequelize.
 *
 * Mapeo:
 * subjectEnrollmentId → matriculaMateriaId → matricula_materia_id
 * levelingId          → nivelacionId       → nivelacion_id
 * stateType           → tipoEstado         → tipo_estado
 * transitionDate      → fechaTransicion    → fecha_transicion
 * resultingGrade      → notaResultante     → nota_resultante
 * forcedGrade         → notaForzada        → nota_forzada
 * current             → vigente            → vigente
 *
 * @implements {IHistorialMatriculaRepository}
 */
export class SubjectEnrollmentHistoryRepository
    extends BaseRepository
    /* implements IHistorialMatriculaRepository */ {
    getModel() {
        return HistorialMatriculaModel;
    }

    toEntity(model) {
        return SubjectEnrollmentHistoryMapper.toEntity(model);
    }

    /**
     * Construye la cláusula WHERE para filtros específicos.
     *
     * Filtros soportados:
     * - subjectEnrollmentId
     * - subjectEnrollmentIds
     * - enrollmentSubjectId              Alias viejo
     * - enrollmentSubjectIds             Alias viejo
     * - levelingId
     * - levelingIds
     * - stateType
     * - stateTypes
     * - transitionDate
     * - transitionDateFrom
     * - transitionDateTo
     * - resultingGrade
     * - forcedGrade
     * - current
     * - observations
     */
    buildWhereClause(filters = {}) {
        const where = {};

        const subjectEnrollmentId =
            filters.subjectEnrollmentId ??
            filters.enrollmentSubjectId;

        const subjectEnrollmentIds =
            filters.subjectEnrollmentIds ??
            filters.enrollmentSubjectIds;

        if (
            subjectEnrollmentIds &&
            Array.isArray(subjectEnrollmentIds) &&
            subjectEnrollmentIds.length > 0
        ) {
            where.matriculaMateriaId = { [Op.in]: subjectEnrollmentIds };
        } else if (subjectEnrollmentId) {
            where.matriculaMateriaId = subjectEnrollmentId;
        }

        if (
            filters.levelingIds &&
            Array.isArray(filters.levelingIds) &&
            filters.levelingIds.length > 0
        ) {
            where.nivelacionId = { [Op.in]: filters.levelingIds };
        } else if (filters.levelingId) {
            where.nivelacionId = filters.levelingId;
        }

        if (
            filters.stateTypes &&
            Array.isArray(filters.stateTypes) &&
            filters.stateTypes.length > 0
        ) {
            where.tipoEstado = { [Op.in]: filters.stateTypes };
        } else if (filters.stateType) {
            where.tipoEstado = filters.stateType;
        }

        if (filters.transitionDate) {
            where.fechaTransicion = filters.transitionDate;
        } else {
            const transitionDateRange = {};

            if (filters.transitionDateFrom) {
                transitionDateRange[Op.gte] = filters.transitionDateFrom;
            }

            if (filters.transitionDateTo) {
                transitionDateRange[Op.lte] = filters.transitionDateTo;
            }

            if (Object.keys(transitionDateRange).length > 0) {
                where.fechaTransicion = transitionDateRange;
            }
        }

        if (filters.resultingGrade !== undefined) {
            where.notaResultante = filters.resultingGrade;
        }

        if (filters.forcedGrade !== undefined) {
            where.notaForzada = filters.forcedGrade;
        }

        if (filters.current !== undefined) {
            where.vigente = filters.current;
        }

        if (filters.observations !== undefined) {
            where.observaciones = filters.observations;
        }

        return where;
    }

    getSearchFields() {
        return ['observaciones'];
    }

    getDefaultSort() {
        return [
            ['fechaTransicion', 'ASC'],
            ['id', 'ASC'],
        ];
    }

    mapDataToModel(data, userId = null) {
        const modelData = SubjectEnrollmentHistoryMapper.toModel(data);

        if (userId !== null && userId !== undefined) {
            modelData.createdBy = userId;
        }

        return modelData;
    }

    mapDataToUpdate(data, userId = null) {
        const modelData = SubjectEnrollmentHistoryMapper.toModelForUpdate(data);

        if (userId !== null && userId !== undefined) {
            modelData.updatedBy = userId;
        }

        return modelData;
    }

    getCollectionName() {
        return 'subjectEnrollmentHistories';
    }

    /**
     * Obtiene el estado vigente de una matrícula de materia.
     */
    async findCurrentBySubjectEnrollmentId(subjectEnrollmentId, options = {}) {
        const model = await HistorialMatriculaModel.findOne({
            where: {
                matriculaMateriaId: subjectEnrollmentId,
                vigente: true,
                activo: true,
                deletedAt: null,
            },
            order: [
                ['fechaTransicion', 'DESC'],
                ['id', 'DESC'],
            ],
            transaction: options.transaction,
        });

        return this.toEntity(model);
    }

    /**
     * Busca historial asociado a una nivelación.
     */
    async findByLevelingId(levelingId, options = {}) {
        const models = await HistorialMatriculaModel.findAll({
            where: {
                nivelacionId: levelingId,
                activo: true,
                deletedAt: null,
            },
            order: [
                ['fechaTransicion', 'ASC'],
                ['id', 'ASC'],
            ],
            transaction: options.transaction,
        });

        return models.map((model) => this.toEntity(model));
    }

    /**
     * Marca como no vigentes los estados actuales de una matrícula.
     *
     * Útil antes de crear un nuevo registro vigente.
     */
    async expireCurrentBySubjectEnrollmentId(
        subjectEnrollmentId,
        userId = null,
        options = {}
    ) {
        const updateData = {
            vigente: false,
        };

        if (userId !== null && userId !== undefined) {
            updateData.updatedBy = userId;
        }

        const [affectedRows] = await HistorialMatriculaModel.update(updateData, {
            where: {
                matriculaMateriaId: subjectEnrollmentId,
                vigente: true,
                activo: true,
                deletedAt: null,
            },
            transaction: options.transaction,
        });

        return affectedRows;
    }
}

export default SubjectEnrollmentHistoryRepository;
