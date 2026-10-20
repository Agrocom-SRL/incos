import { Op } from 'sequelize';
import { MatriculaMateria as MatriculaMateriaModel } from '../database/models/matricula_materia.js';
import { BaseRepository } from './BaseRepository.js';
import { SubjectEnrollmentMapper } from '../mappers/SubjectEnrollmentMapper.js';
import { sequelize } from '../database/sequelize.js';

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
     * - offerCourseId        → ofertaCursoId         → oferta_curso_id
     * - curriculumSubjectId  → asignaturaPlanId      → asignatura_plan_id
     * - finalGrade           → notaFinal             → nota_final
     * - status               → estado                → estado
     * - statusHistory        → historialEstados      → historial_estados
     * - observations         → observaciones         → observaciones
     *
     * @param {Object} filters
     *   - enrollmentId
     *   - enrollmentIds
     *   - offerCourseId
     *   - offerCourseIds
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
            filters.offerCourseIds &&
            Array.isArray(filters.offerCourseIds) &&
            filters.offerCourseIds.length > 0
        ) {
            where.ofertaCursoId = { [Op.in]: filters.offerCourseIds };
        } else if (filters.offerCourseId) {
            where.ofertaCursoId = filters.offerCourseId;
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
    mapDataToModel(data, _userId = null) {
        return SubjectEnrollmentMapper.toModel(data);
    }

    /**
     * Mapea datos de dominio a formato Sequelize para actualización.
     *
     * @param {SubjectEnrollment|Object} data
     * @param {number|null} userId
     * @returns {Object}
     */
    mapDataToUpdate(data, _userId = null) {
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

    // ============================================
    // Operaciones de negocio sobre matriculas_materia (set-based).
    // La orquestación multi-tabla (con bimestres_matricula) vive en los casos
    // de uso; aquí solo se escribe/lee la tabla matriculas_materia.
    // ============================================

    /**
     * ¿Existe al menos una matrícula en cursado/cerrado en la gestión?
     * (indicador de "gestión académica ya iniciada").
     * @param {number} gestionId — PK de gestiones
     * @returns {Promise<boolean>}
     */
    async existeCursandoEnGestion(gestionId) {
        const rows = await sequelize.query(
            `
            SELECT COUNT(*) AS total
            FROM matriculas_materia mm
            INNER JOIN oferta_cursos oc ON oc.id = mm.oferta_curso_id
            INNER JOIN paralelos_gestion pg ON pg.id = oc.paralelo_gestion_id
            INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id
            WHERE gp.gestion_id = ?
              AND mm.estado IN ('CURSANDO', 'APROBADO', 'REPROBADO')
              AND mm.deleted_at IS NULL
              AND mm.activo = TRUE
            `,
            { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
        );
        return Number(rows[0]?.total ?? 0) > 0;
    }

    /**
     * Cuenta matrículas en estado CURSANDO de una gestión.
     * @param {number} gestionId — PK de gestiones
     * @returns {Promise<number>}
     */
    async contarCursandoEnGestion(gestionId) {
        const rows = await sequelize.query(
            `
            SELECT COUNT(*) AS total
            FROM matriculas_materia mm
            INNER JOIN oferta_cursos oc ON oc.id = mm.oferta_curso_id
            INNER JOIN paralelos_gestion pg ON pg.id = oc.paralelo_gestion_id
            INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id
            WHERE gp.gestion_id = ?
              AND mm.estado = 'CURSANDO'
            `,
            { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
        );
        return Number(rows[0]?.total ?? 0) || 0;
    }

    /**
     * Transiciona INSCRITO → CURSANDO todas las matrículas de una gestión.
     * @param {number} gestionId — PK de gestiones
     * @param {number|null} userId
     * @param {{ transaction?: import('sequelize').Transaction }} [options]
     * @returns {Promise<number>} filas afectadas
     */
    async marcarCursandoPorGestion(gestionId, userId = null, { transaction } = {}) {
        const [, meta] = await sequelize.query(
            `
            UPDATE matriculas_materia mm
            INNER JOIN oferta_cursos oc ON oc.id = mm.oferta_curso_id
            INNER JOIN paralelos_gestion pg ON pg.id = oc.paralelo_gestion_id
            INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id
            SET mm.estado = 'CURSANDO',
                mm.historial_estados = JSON_SET(
                    COALESCE(mm.historial_estados, JSON_OBJECT()),
                    '$.CURSANDO', DATE_FORMAT(CURDATE(), '%Y-%m-%d')
                ),
                mm.updated_by = ?,
                mm.updated_at = NOW()
            WHERE gp.gestion_id = ?
              AND mm.estado = 'INSCRITO'
              AND mm.deleted_at IS NULL
              AND mm.activo = TRUE
            `,
            { replacements: [userId, gestionId], transaction },
        );
        return meta?.affectedRows ?? 0;
    }

    /**
     * Transiciona INSCRITO → CURSANDO las matrículas de una inscripción.
     * @param {number} inscripcionId
     * @param {number|null} userId
     * @param {{ transaction?: import('sequelize').Transaction }} [options]
     * @returns {Promise<number>} filas afectadas
     */
    async marcarCursandoPorInscripcion(inscripcionId, userId = null, { transaction } = {}) {
        const [, meta] = await sequelize.query(
            `
            UPDATE matriculas_materia mm
            SET mm.estado = 'CURSANDO',
                mm.historial_estados = JSON_SET(
                    COALESCE(mm.historial_estados, JSON_OBJECT()),
                    '$.CURSANDO', DATE_FORMAT(CURDATE(), '%Y-%m-%d')
                ),
                mm.updated_by = ?,
                mm.updated_at = NOW()
            WHERE mm.inscripcion_id = ?
              AND mm.estado = 'INSCRITO'
              AND mm.deleted_at IS NULL
              AND mm.activo = TRUE
            `,
            { replacements: [userId, inscripcionId], transaction },
        );
        return meta?.affectedRows ?? 0;
    }

    /**
     * Actualiza la nota final de una matrícula de materia (cierre de cuaderno).
     * @returns {Promise<void>}
     */
    async actualizarNotaFinalMatricula(matriculaMateriaId, notaFinal, usuarioId, { transaction } = {}) {
        await sequelize.query(
            `
            UPDATE matriculas_materia
            SET nota_final = ?, updated_by = ?, updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
            `,
            {
                replacements: [notaFinal, usuarioId, matriculaMateriaId],
                type: sequelize.QueryTypes.UPDATE,
                transaction,
            },
        );
    }
}
