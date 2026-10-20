import { Enrollment } from '../../domain/entities/Enrollment.js';
import { BaseMapper } from './BaseMapper.js';
import { TIPOS_INSCRIPCION } from '../../domain/constants/inscripciones.constants.js';

/**
 * Mapper: EnrollmentMapper
 *
 * Convierte entre:
 * Modelo Sequelize en español: Inscripcion
 * Entidad de dominio en inglés: Enrollment
 *
 * Mapeo:
 * datosAcademicosId  → academicDataId
 * gestionId          → managementId
 * tipoInscripcion    → enrollmentType
 * fechaInscripcion   → enrollmentDate
 * observaciones      → observations
 */
export class EnrollmentMapper {
    /**
     * Convierte un modelo Sequelize a entidad de dominio.
     *
     * @param {Object|null} model - Modelo Sequelize Inscripcion
     * @returns {Enrollment|null}
     */
    static toEntity(model) {
        if (!model) return null;

        const dataValues = model.dataValues || model;
        const specificFields = {};

        if ('datosAcademicosId' in dataValues && dataValues.datosAcademicosId !== undefined) {
            specificFields.academicDataId = dataValues.datosAcademicosId;
        }

        if ('gestionId' in dataValues && dataValues.gestionId !== undefined) {
            specificFields.managementId = dataValues.gestionId;
        }

        if ('tipoInscripcion' in dataValues && dataValues.tipoInscripcion !== undefined) {
            specificFields.enrollmentType = dataValues.tipoInscripcion;
        }

        if ('fechaInscripcion' in dataValues && dataValues.fechaInscripcion !== undefined) {
            specificFields.enrollmentDate = dataValues.fechaInscripcion;
        }

        if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
            specificFields.observations = dataValues.observaciones;
        }

        const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

        return new Enrollment(entityData);
    }

    /**
     * Convierte entidad de dominio a formato del modelo Sequelize para creación.
     *
     * @param {Enrollment|Object} entity
     * @returns {Object}
     */
    static toModel(entity) {
        const data = entity instanceof Enrollment ? entity.toPlainObject() : entity;

        return {
            datosAcademicosId: data.academicDataId ?? null,
            gestionId: data.managementId ?? null,
            tipoInscripcion: data.enrollmentType ?? TIPOS_INSCRIPCION.ANTIGUO,
            fechaInscripcion: data.enrollmentDate ?? null,
            observaciones: data.observations ?? null,
        };
    }

    /**
     * Convierte entidad de dominio a formato del modelo Sequelize para actualización.
     * Solo incluye campos definidos.
     *
     * @param {Enrollment|Object} entity
     * @returns {Object}
     */
    static toModelForUpdate(entity) {
        const data = entity instanceof Enrollment ? entity.toPlainObject() : entity;
        const updateData = {};

        if ('academicDataId' in data) {
            updateData.datosAcademicosId = data.academicDataId ?? null;
        }

        if ('managementId' in data) {
            updateData.gestionId = data.managementId ?? null;
        }

        if ('enrollmentType' in data) {
            updateData.tipoInscripcion = data.enrollmentType;
        }

        if ('enrollmentDate' in data) {
            updateData.fechaInscripcion = data.enrollmentDate ?? null;
        }

        if ('observations' in data) {
            updateData.observaciones = data.observations ?? null;
        }

        const baseFields = BaseMapper.baseFieldsToModelForUpdate(entity);
        Object.assign(updateData, baseFields);

        return updateData;
    }

    /**
     * Convierte un array de modelos Sequelize a entidades.
     *
     * @param {Array} models
     * @returns {Enrollment[]}
     */
    static toEntityList(models) {
        if (!models || !Array.isArray(models)) return [];

        return models
            .map((model) => this.toEntity(model))
            .filter((entity) => entity !== null);
    }
}

export default EnrollmentMapper;
