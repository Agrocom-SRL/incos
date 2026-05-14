import { SubjectEnrollment } from '../../domain/entities/SubjectEnrollment.js';
import { BaseMapper } from './BaseMapper.js';
import { ESTADOS_MATERIA_INSCRITA } from '../../domain/constants/inscripciones.constants.js';

/**
 * Mapper: SubjectEnrollmentMapper
 *
 * Convierte entre:
 * Modelo Sequelize en español: MatriculaMateria
 * Entidad de dominio en inglés: SubjectEnrollment
 *
 * Mapeo:
 * inscripcionId        → enrollmentId
 * asignacionDocenteId  → teacherAssignmentId
 * asignaturaPlanId     → curriculumSubjectId
 * notaFinal            → finalGrade
 * estado               → status
 * historialEstados     → statusHistory
 * observaciones        → observations
 */
export class SubjectEnrollmentMapper {
    /**
     * Convierte un modelo Sequelize a entidad de dominio.
     *
     * @param {Object|null} model - Modelo Sequelize MatriculaMateria
     * @returns {SubjectEnrollment|null}
     */
    static toEntity(model) {
        if (!model) return null;

        const dataValues = model.dataValues || model;
        const specificFields = {};

        if ('inscripcionId' in dataValues && dataValues.inscripcionId !== undefined) {
            specificFields.enrollmentId = dataValues.inscripcionId;
        }

        if ('asignacionDocenteId' in dataValues && dataValues.asignacionDocenteId !== undefined) {
            specificFields.teacherAssignmentId = dataValues.asignacionDocenteId;
        }

        if ('asignaturaPlanId' in dataValues && dataValues.asignaturaPlanId !== undefined) {
            specificFields.curriculumSubjectId = dataValues.asignaturaPlanId;
        }

        if ('notaFinal' in dataValues && dataValues.notaFinal !== undefined) {
            specificFields.finalGrade =
                dataValues.notaFinal === null ? null : Number(dataValues.notaFinal);
        }

        if ('estado' in dataValues && dataValues.estado !== undefined) {
            specificFields.status = dataValues.estado;
        }

        if ('historialEstados' in dataValues && dataValues.historialEstados !== undefined) {
            specificFields.statusHistory = dataValues.historialEstados;
        }

        if ('observaciones' in dataValues && dataValues.observaciones !== undefined) {
            specificFields.observations = dataValues.observaciones;
        }

        const entityData = BaseMapper.combineBaseAndSpecificFields(model, specificFields);

        return new SubjectEnrollment(entityData);
    }

    /**
     * Convierte entidad de dominio a formato del modelo Sequelize para creación.
     *
     * @param {SubjectEnrollment|Object} entity
     * @returns {Object}
     */
    static toModel(entity) {
        const data = entity instanceof SubjectEnrollment
            ? entity.toPlainObject()
            : entity;

        return {
            inscripcionId: data.enrollmentId ?? null,
            asignacionDocenteId: data.teacherAssignmentId ?? null,
            asignaturaPlanId: data.curriculumSubjectId ?? null,
            notaFinal: data.finalGrade ?? null,
            estado: data.status ?? ESTADOS_MATERIA_INSCRITA.INSCRITO,
            historialEstados: data.statusHistory ?? null,
            observaciones: data.observations ?? null,
        };
    }

    /**
     * Convierte entidad de dominio a formato del modelo Sequelize para actualización.
     * Solo incluye campos definidos.
     *
     * @param {SubjectEnrollment|Object} entity
     * @returns {Object}
     */
    static toModelForUpdate(entity) {
        const data = entity instanceof SubjectEnrollment
            ? entity.toPlainObject()
            : entity;

        const updateData = {};

        if ('enrollmentId' in data) {
            updateData.inscripcionId = data.enrollmentId ?? null;
        }

        if ('teacherAssignmentId' in data) {
            updateData.asignacionDocenteId = data.teacherAssignmentId ?? null;
        }

        if ('curriculumSubjectId' in data) {
            updateData.asignaturaPlanId = data.curriculumSubjectId ?? null;
        }

        if ('finalGrade' in data) {
            updateData.notaFinal = data.finalGrade ?? null;
        }

        if ('status' in data) {
            updateData.estado = data.status;
        }

        if ('statusHistory' in data) {
            updateData.historialEstados = data.statusHistory ?? null;
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
     * @returns {SubjectEnrollment[]}
     */
    static toEntityList(models) {
        if (!models || !Array.isArray(models)) return [];

        return models
            .map((model) => this.toEntity(model))
            .filter((entity) => entity !== null);
    }
}

export default SubjectEnrollmentMapper;