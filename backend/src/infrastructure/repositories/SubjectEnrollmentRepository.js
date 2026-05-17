import { Op } from 'sequelize';
import { IMatriculaMateriaRepository } from '../../domain/interfaces/repositories/IMatriculaMateriaRepository.js';
import { MatriculaMateria as MatriculaMateriaModel } from '../database/models/matricula_materia.js';
import { BaseRepository } from './BaseRepository.js';
import { SubjectEnrollmentMapper } from '../mappers/SubjectEnrollmentMapper.js';

/**
 * Implementación del repositorio de matrículas de materia usando Sequelize.
 *
 * Convención de capas:
 * IMatriculaMateriaRepository → models/matricula_materia.js (`matriculas_materia`)
 * → SubjectEnrollment / SubjectEnrollmentMapper / SubjectEnrollmentRepository
 *
 * @implements {IMatriculaMateriaRepository}
 */
export class SubjectEnrollmentRepository extends BaseRepository {
    /**
     * Obtiene el modelo Sequelize de matrículas de materia.
     *
     * @returns {Object} Modelo MatriculaMateria
     */
    getModel() {
        return MatriculaMateriaModel;
    }

    /**
     * Convierte un modelo Sequelize a entidad de dominio.
     *
     * @param {Object} model - Modelo Sequelize
     * @returns {SubjectEnrollment|null}
     */
    toEntity(model) {
        return SubjectEnrollmentMapper.toEntity(model);
    }

    /**
     * Construye la cláusula WHERE para filtros específicos.
     *
     * Mapeo:
     * - enrollmentId         → inscripcionId         → inscripcion_id
     * - teacherAssignmentId  → asignacionDocenteId   → asignacion_docente_id
     * - curriculumSubjectId  → asignaturaPlanId      → asignatura_plan_id
     * - finalGrade           → notaFinal             → nota_final
     * - status               → estado                → estado
     * - statusHistory        → historialEstados      → historial_estados
     * - observations         → observaciones         → observaciones
     *
     * @param {Object} filters
     *   - enrollmentId
     *   - enrollmentIds
     *   - teacherAssignmentId
     *   - teacherAssignmentIds
     *   - curriculumSubjectId
     *   - finalGrade
     *   - status
     *   - observations
     *
     * @returns {Object}
     */
    buildWhereClause(filters = {}) {
        const where = {};

        if (
            filters.enrollmentIds &&
            Array.isArray(filters.enrollmentIds) &&
            filters.enrollmentIds.length > 0
        ) {
            where.inscripcionId = { [Op.in]: filters.enrollmentIds };
        } else if (filters.enrollmentId) {
            where.inscripcionId = filters.enrollmentId;
        }

        if (
            filters.teacherAssignmentIds &&
            Array.isArray(filters.teacherAssignmentIds) &&
            filters.teacherAssignmentIds.length > 0
        ) {
            where.asignacionDocenteId = { [Op.in]: filters.teacherAssignmentIds };
        } else if (filters.teacherAssignmentId) {
            where.asignacionDocenteId = filters.teacherAssignmentId;
        }

        if (filters.curriculumSubjectId) {
            where.asignaturaPlanId = filters.curriculumSubjectId;
        }

        if (filters.finalGrade !== undefined) {
            where.notaFinal = filters.finalGrade;
        }

        if (filters.status) {
            where.estado = filters.status;
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
        return [];
    }

    /**
     * Mapea datos de dominio a formato Sequelize para creación.
     *
     * @param {SubjectEnrollment|Object} data
     * @param {number|null} userId
     * @returns {Object}
     */
    mapDataToModel(data, userId = null) {
        return SubjectEnrollmentMapper.toModel(data);
    }

    /**
     * Mapea datos de dominio a formato Sequelize para actualización.
     *
     * @param {SubjectEnrollment|Object} data
     * @param {number|null} userId
     * @returns {Object}
     */
    mapDataToUpdate(data, userId = null) {
        return SubjectEnrollmentMapper.toModelForUpdate(data);
    }

    /**
     * Nombre de la colección en la respuesta JSON.
     *
     * @returns {string}
     */
    getCollectionName() {
        return 'subjectEnrollments';
    }
}