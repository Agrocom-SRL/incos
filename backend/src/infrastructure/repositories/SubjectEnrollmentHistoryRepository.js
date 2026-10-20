import { Op } from 'sequelize';
import { HistorialMatricula as HistorialMatriculaModel } from '../database/models/historial_matricula.js';
import { Nivelacion as NivelacionModel } from '../database/models/nivelacion.js';
import { BaseRepository } from './BaseRepository.js';
import { SubjectEnrollmentHistoryMapper } from '../mappers/SubjectEnrollmentHistoryMapper.js';

/**
 * Implementación del repositorio de historial de matrícula usando Sequelize.
 *
 * Mapeo:
 * subjectEnrollmentId → matriculaMateriaId → matricula_materia_id
 * stateType           → tipoEstado         → tipo_estado
 * transitionDate      → fechaTransicion    → fecha_transicion
 * resultingGrade      → notaResultante     → nota_resultante
 * forcedGrade         → notaForzada        → nota_forzada
 * current             → vigente            → vigente
 *
 * @implements {IHistorialMatriculaRepository}
 */
export class SubjectEnrollmentHistoryRepository extends BaseRepository {
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

        // Ancla alterna (materia NO cursada): inscripcionId + asignaturaPlanId juntos.
        if (filters.enrollmentId !== undefined) {
            where.inscripcionId = filters.enrollmentId;
        }
        if (filters.planSubjectId !== undefined) {
            where.asignaturaPlanId = filters.planSubjectId;
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
        const nivelacion = await NivelacionModel.findOne({
            where: {
                id: levelingId,
                activo: true,
                deletedAt: null,
            },
            transaction: options.transaction,
        });

        if (!nivelacion?.historialMatriculaId) {
            return [];
        }

        const model = await HistorialMatriculaModel.findOne({
            where: {
                id: nivelacion.historialMatriculaId,
                activo: true,
                deletedAt: null,
            },
            transaction: options.transaction,
        });

        return model ? [this.toEntity(model)] : [];
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

    /**
     * Obtiene el estado vigente de la ancla alterna (materia NO cursada:
     * arrastre/choque horario/etc.). Espejo de findCurrentBySubjectEnrollmentId.
     */
    async findCurrentByAlternateAnchor(enrollmentId, planSubjectId, options = {}) {
        const model = await HistorialMatriculaModel.findOne({
            where: {
                inscripcionId: enrollmentId,
                asignaturaPlanId: planSubjectId,
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
     * Marca como no vigentes los estados actuales de la ancla alterna.
     * Espejo de expireCurrentBySubjectEnrollmentId.
     */
    async expireCurrentByAlternateAnchor(enrollmentId, planSubjectId, userId = null, options = {}) {
        const updateData = {
            vigente: false,
        };

        if (userId !== null && userId !== undefined) {
            updateData.updatedBy = userId;
        }

        const [affectedRows] = await HistorialMatriculaModel.update(updateData, {
            where: {
                inscripcionId: enrollmentId,
                asignaturaPlanId: planSubjectId,
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
