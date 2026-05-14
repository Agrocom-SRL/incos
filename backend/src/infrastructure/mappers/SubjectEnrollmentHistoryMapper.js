import { SubjectEnrollmentHistory } from '../../domain/entities/SubjectEnrollmentHistory.js';
import { BaseMapper } from './BaseMapper.js';

/**
 * Mapper: SubjectEnrollmentHistoryMapper
 *
 * Convierte entre:
 * Modelo Sequelize en español: HistorialMatricula
 * Entidad de dominio en inglés: SubjectEnrollmentHistory
 *
 * Mapeo:
 * matriculaMateriaId  → subjectEnrollmentId
 * tipoEstado          → stateType
 * fechaTransicion     → transitionDate
 * notaResultante      → resultingGrade
 * notaForzada         → forcedGrade
 * observaciones       → observations
 * vigente             → current
 */
export class SubjectEnrollmentHistoryMapper {
    /**
     * Convierte un modelo Sequelize a entidad de dominio.
     *
     * @param {Object|null} model - Modelo Sequelize HistorialMatricula
     * @returns {SubjectEnrollmentHistory|null}
     */
    static toEntity(model) {
        if (!model) return null;

        const dataValues = model.dataValues || model;
        const specificFields = {};

        if ('matriculaMateriaId' in dataValues && dataValues.matriculaMateriaId !== undefined) {
            specificFields.subjectEnrollmentId = dataValues.matriculaMateriaId;
        }

        if ('tipoEstado' in dataValues && dataValues.tipoEstado !== undefined) {
            specificFields.stateType = dataValues.tipoEstado;
        }

        if ('fechaTransicion' in dataValues && dataValues.fechaTransicion !== undefined) {
            specificFields.transitionDate = dataValues.fechaTransicion;
        }

        if ('notaResultante' in dataValues && dataValues.notaResultante !== undefined) {
            specificFields.resultingGrade =
                dataValues.notaResultante === null ? null : Number(dataValues.notaResultante);
        }

        if ('notaForzada' in dataValues && dataValues.notaForzada !== undefined) {
            specificFields.forcedGrade = Boolean(dataValues.notaForzada);
        }

        if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
            specificFields.observations = dataValues.observaciones;
        }

        if ('vigente' in dataValues && dataValues.vigente !== undefined) {
            specificFields.current = Boolean(dataValues.vigente);
        }

        const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

        return new SubjectEnrollmentHistory(entityData);
    }

    /**
     * Convierte entidad de dominio a formato del modelo Sequelize para creación.
     *
     * @param {SubjectEnrollmentHistory|Object} entity
     * @returns {Object}
     */
    static toModel(entity) {
        const data = entity instanceof SubjectEnrollmentHistory
            ? entity.toPlainObject()
            : entity;

        return {
            matriculaMateriaId: data.subjectEnrollmentId ?? null,
            tipoEstado: data.stateType,
            fechaTransicion: data.transitionDate ?? null,
            notaResultante: data.resultingGrade ?? null,
            notaForzada: data.forcedGrade ?? false,
            observaciones: data.observations ?? null,
            vigente: data.current ?? true,
        };
    }

    /**
     * Convierte entidad de dominio a formato del modelo Sequelize para actualización.
     * Solo incluye campos definidos.
     *
     * @param {SubjectEnrollmentHistory|Object} entity
     * @returns {Object}
     */
    static toModelForUpdate(entity) {
        const data = entity instanceof SubjectEnrollmentHistory
            ? entity.toPlainObject()
            : entity;

        const updateData = {};

        if ('subjectEnrollmentId' in data) {
            updateData.matriculaMateriaId = data.subjectEnrollmentId ?? null;
        }

        if ('stateType' in data) {
            updateData.tipoEstado = data.stateType;
        }

        if ('transitionDate' in data) {
            updateData.fechaTransicion = data.transitionDate ?? null;
        }

        if ('resultingGrade' in data) {
            updateData.notaResultante = data.resultingGrade ?? null;
        }

        if ('forcedGrade' in data) {
            updateData.notaForzada = data.forcedGrade ?? false;
        }

        if ('observations' in data) {
            updateData.observaciones = data.observations ?? null;
        }

        if ('current' in data) {
            updateData.vigente = data.current ?? true;
        }

        const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
        Object.assign(updateData, baseFields);

        return updateData;
    }

    /**
     * Convierte un array de modelos Sequelize a entidades.
     *
     * @param {Array} models
     * @returns {SubjectEnrollmentHistory[]}
     */
    static toEntityList(models) {
        if (!models || !Array.isArray(models)) return [];

        return models
            .map((model) => this.toEntity(model))
            .filter((entity) => entity !== null);
    }
}

export default SubjectEnrollmentHistoryMapper;