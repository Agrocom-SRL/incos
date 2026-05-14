import { Op } from 'sequelize';
import { IHistorialMatriculaRepository } from '../../domain/interfaces/repositories/IHistorialMatriculaRepository.js';
import { HistorialMatricula as HistorialMatriculaModel } from '../database/models/historial_matricula.js';
import { BaseRepository } from './BaseRepository.js';
import { SubjectEnrollmentHistoryMapper } from '../mappers/SubjectEnrollmentHistoryMapper.js';

/**
 * Implementación del repositorio de historial de matrícula usando Sequelize.
 *
 * Convención de capas:
 * IHistorialMatriculaRepository → models/historial_matricula.js (`historial_matricula`)
 * → SubjectEnrollmentHistory / SubjectEnrollmentHistoryMapper / SubjectEnrollmentHistoryRepository
 *
 * @implements {IHistorialMatriculaRepository}
 */
export class SubjectEnrollmentHistoryRepository extends BaseRepository {
    /**
     * Obtiene el modelo Sequelize de historial de matrícula.
     *
     * @returns {Object} Modelo HistorialMatricula
     */
    getModel() {
        return HistorialMatriculaModel;
    }

    /**
     * Convierte un modelo Sequelize a entidad de dominio.
     *
     * @param {Object} model - Modelo Sequelize
     * @returns {SubjectEnrollmentHistory|null}
     */
    toEntity(model) {
        return SubjectEnrollmentHistoryMapper.toEntity(model);
    }

    /**
     * Construye la cláusula WHERE para filtros específicos.
     *
     * Mapeo:
     * - subjectEnrollmentId   → matriculaMateriaId  → matricula_materia_id
     * - stateType             → tipoEstado          → tipo_estado
     * - transitionDate        → fechaTransicion     → fecha_transicion
     * - resultingGrade        → notaResultante      → nota_resultante
     * - forcedGrade           → notaForzada         → nota_forzada
     * - current               → vigente             → vigente
     * - observations          → observaciones       → observaciones
     *
     * @param {Object} filters
     *   - subjectEnrollmentId
     *   - subjectEnrollmentIds
     *   - stateType
     *   - stateTypes
     *   - transitionDate
     *   - resultingGrade
     *   - forcedGrade
     *   - current
     *   - observations
     *
     * @returns {Object}
     */
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

    /**
     * Campos usados para búsqueda de texto.
     *
     * @returns {string[]}
     */
    getSearchFields() {
        return ['observaciones'];
    }

    /**
     * Orden por defecto.
     *
     * @returns {Array}
     */
    getDefaultSort() {
        return [
            ['fechaTransicion', 'ASC'],
            ['id', 'ASC'],
        ];
    }

    /**
     * Mapea datos de dominio a formato Sequelize para creación.
     *
     * @param {SubjectEnrollmentHistory|Object} data
     * @param {number|null} userId
     * @returns {Object}
     */
    mapDataToModel(data, userId = null) {
        return SubjectEnrollmentHistoryMapper.toModel(data);
    }

    /**
     * Mapea datos de dominio a formato Sequelize para actualización.
     *
     * @param {SubjectEnrollmentHistory|Object} data
     * @param {number|null} userId
     * @returns {Object}
     */
    mapDataToUpdate(data, userId = null) {
        return SubjectEnrollmentHistoryMapper.toModelForUpdate(data);
    }

    /**
     * Nombre de la colección en la respuesta JSON.
     *
     * @returns {string}
     */
    getCollectionName() {
        return 'subjectEnrollmentHistories';
    }
}