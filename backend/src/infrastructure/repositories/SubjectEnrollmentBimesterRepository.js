import { Op } from 'sequelize';
import { IBimestreMatriculaRepository } from '../../domain/interfaces/repositories/IBimestreMatriculaRepository.js';
import { BimestreMatricula as BimestreMatriculaModel } from '../database/models/bimestre_matricula.js';
import { BaseRepository } from './BaseRepository.js';
import { SubjectEnrollmentBimesterMapper } from '../mappers/SubjectEnrollmentBimesterMapper.js';
import { sequelize } from '../database/sequelize.js';

/**
 * @implements {IBimestreMatriculaRepository}
 */
export class SubjectEnrollmentBimesterRepository extends BaseRepository {
    getModel() {
        return BimestreMatriculaModel;
    }

    toEntity(model) {
        return SubjectEnrollmentBimesterMapper.toEntity(model);
    }

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

        if (filters.bimester !== undefined) {
            where.bimestre = filters.bimester;
        }
        if (filters.bimesters && Array.isArray(filters.bimesters) && filters.bimesters.length > 0) {
            where.bimestre = { [Op.in]: filters.bimesters };
        }

        if (filters.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
            where.estado = { [Op.in]: filters.statuses };
        } else if (filters.status) {
            where.estado = filters.status;
        }

        if (filters.closedBy !== undefined) {
            where.cerradoPor = filters.closedBy;
        }

        return where;
    }

    getSearchFields() {
        return ['observaciones'];
    }

    getDefaultSort() {
        return [['bimestre', 'ASC'], ['id', 'ASC']];
    }

    mapDataToModel(data, userId = null) {
        return SubjectEnrollmentBimesterMapper.toModel(data);
    }

    mapDataToUpdate(data, userId = null) {
        return SubjectEnrollmentBimesterMapper.toModelForUpdate(data);
    }

    getCollectionName() {
        return 'subjectEnrollmentBimesters';
    }

    // ============================================
    // Apertura de bimestres (set-based, idempotente: solo crea faltantes).
    // Escribe únicamente bimestres_matricula; lee matriculas_materia como origen.
    // La orquestación con la transición de matriculas_materia vive en el caso de uso.
    // ============================================

    /**
     * Abre los 4 bimestres faltantes (B1=EN_CURSO, B2-4=PENDIENTE) de cada
     * matrícula CURSANDO de una gestión. Idempotente.
     * @param {number} gestionId — PK de gestiones
     * @param {number|null} userId
     * @param {{ transaction?: import('sequelize').Transaction }} [options]
     * @returns {Promise<void>}
     */
    async abrirBimestresFaltantesPorGestion(gestionId, userId = null, { transaction } = {}) {
        await sequelize.query(
            `
            INSERT INTO bimestres_matricula (
                matricula_materia_id, bimestre, estado, created_by, updated_by, activo
            )
            SELECT
                mm.id,
                nums.n,
                CASE WHEN nums.n = 1 THEN 'EN_CURSO' ELSE 'PENDIENTE' END,
                ?,
                ?,
                TRUE
            FROM matriculas_materia mm
            INNER JOIN oferta_cursos oc ON oc.id = mm.oferta_curso_id
            INNER JOIN paralelos_gestion pg ON pg.id = oc.paralelo_gestion_id
            INNER JOIN gestiones_planes gp ON gp.id = pg.gestion_plan_id
            CROSS JOIN (
                SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
            ) nums
            LEFT JOIN bimestres_matricula bm
                ON bm.matricula_materia_id = mm.id
                AND bm.bimestre = nums.n
                AND bm.deleted_at IS NULL
            WHERE gp.gestion_id = ?
              AND mm.estado = 'CURSANDO'
              AND mm.deleted_at IS NULL
              AND mm.activo = TRUE
              AND bm.id IS NULL
            `,
            { replacements: [userId, userId, gestionId], transaction },
        );
    }

    /**
     * Abre los 4 bimestres faltantes de cada matrícula CURSANDO de una inscripción.
     * Idempotente.
     * @param {number} inscripcionId
     * @param {number|null} userId
     * @param {{ transaction?: import('sequelize').Transaction }} [options]
     * @returns {Promise<void>}
     */
    async abrirBimestresFaltantesPorInscripcion(inscripcionId, userId = null, { transaction } = {}) {
        await sequelize.query(
            `
            INSERT INTO bimestres_matricula (
                matricula_materia_id, bimestre, estado, created_by, updated_by, activo
            )
            SELECT
                mm.id,
                nums.n,
                CASE WHEN nums.n = 1 THEN 'EN_CURSO' ELSE 'PENDIENTE' END,
                ?,
                ?,
                TRUE
            FROM matriculas_materia mm
            CROSS JOIN (
                SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
            ) nums
            LEFT JOIN bimestres_matricula bm
                ON bm.matricula_materia_id = mm.id
                AND bm.bimestre = nums.n
                AND bm.deleted_at IS NULL
            WHERE mm.inscripcion_id = ?
              AND mm.estado = 'CURSANDO'
              AND mm.deleted_at IS NULL
              AND mm.activo = TRUE
              AND bm.id IS NULL
            `,
            { replacements: [userId, userId, inscripcionId], transaction },
        );
    }

    // ============================================
    // Lecturas/escrituras puntuales de bimestres_matricula usadas por el cuaderno.
    // (Antes vivían en CuadernoRepository; aquí se concentra la tabla.)
    // ============================================

    /**
     * Id de bimestre_matricula de un estudiante en un curso/bimestre (vista cuaderno).
     * @returns {Promise<number|null>}
     */
    async obtenerBimestreMatriculaId(asignacionId, estudianteId, bimestreNum) {
        const rows = await sequelize.query(
            `
            SELECT bimestre_matricula_id AS id
            FROM vista_base_cuaderno_estudiante_bimestre_matricula
            WHERE asignacion_docente_id = ?
              AND estudiante_id = ?
              AND bimestre = ?
            LIMIT 1
            `,
            { replacements: [asignacionId, estudianteId, bimestreNum], type: sequelize.QueryTypes.SELECT },
        );
        return rows[0]?.id != null ? Number(rows[0].id) : null;
    }

    /**
     * Crea la fila en bimestres_matricula si el estudiante está matriculado pero aún no tiene el bimestre.
     * @returns {Promise<number|null>}
     */
    async asegurarBimestreMatriculaId(asignacionId, estudianteId, bimestreNum, usuarioId, { transaction } = {}) {
        const existente = await this.obtenerBimestreMatriculaId(asignacionId, estudianteId, bimestreNum);
        if (existente) return existente;

        const mmRows = await sequelize.query(
            `
            SELECT mm.id AS matricula_materia_id
            FROM matriculas_materia mm
            INNER JOIN inscripciones ins ON ins.id = mm.inscripcion_id
              AND ins.deleted_at IS NULL AND ins.activo = TRUE
            INNER JOIN estudiantes_datos_academicos eda ON eda.id = ins.datos_academicos_id
              AND eda.deleted_at IS NULL AND eda.activo = TRUE
            INNER JOIN estudiantes est ON est.id = eda.estudiante_id
              AND est.deleted_at IS NULL AND est.activo = TRUE
            WHERE mm.oferta_curso_id = (
                SELECT oferta_curso_id FROM asignaciones_docentes
                WHERE id = ? AND deleted_at IS NULL
              )
              AND est.id = ?
              AND mm.estado IN ('INSCRITO', 'CURSANDO')
              AND mm.deleted_at IS NULL
              AND mm.activo = TRUE
            LIMIT 1
            `,
            { replacements: [asignacionId, estudianteId], type: sequelize.QueryTypes.SELECT, transaction },
        );

        const matriculaMateriaId = mmRows[0]?.matricula_materia_id;
        if (!matriculaMateriaId) return null;

        const insert = await sequelize.query(
            `
            INSERT INTO bimestres_matricula (
              matricula_materia_id, bimestre, estado, activo, created_by, updated_by
            )
            VALUES (?, ?, 'EN_CURSO', TRUE, ?, ?)
            `,
            {
                replacements: [matriculaMateriaId, bimestreNum, usuarioId, usuarioId],
                type: sequelize.QueryTypes.INSERT,
                transaction,
            },
        );

        const nuevoId = Number(Array.isArray(insert) ? insert[0] : insert);
        return Number.isFinite(nuevoId) && nuevoId > 0 ? nuevoId : null;
    }

    /**
     * Asegura las 4 filas de bimestre por cada matrícula activa del curso (idempotente).
     * @returns {Promise<void>}
     */
    async asegurarBimestresMatriculaCurso(asignacionId, bimestreVigenteNum, usuarioId, { transaction } = {}) {
        await sequelize.query(
            `
            INSERT INTO bimestres_matricula (
              matricula_materia_id, bimestre, estado, activo, created_by, updated_by
            )
            SELECT
              mm.id,
              nums.n,
              CASE WHEN nums.n = ? THEN 'EN_CURSO' ELSE 'PENDIENTE' END,
              TRUE,
              ?,
              ?
            FROM matriculas_materia mm
            CROSS JOIN (
              SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
            ) nums
            LEFT JOIN bimestres_matricula bm
              ON bm.matricula_materia_id = mm.id
              AND bm.bimestre = nums.n
              AND bm.deleted_at IS NULL
            WHERE mm.oferta_curso_id = (
                SELECT oferta_curso_id FROM asignaciones_docentes
                WHERE id = ? AND deleted_at IS NULL
              )
              AND mm.estado IN ('INSCRITO', 'CURSANDO')
              AND mm.deleted_at IS NULL
              AND mm.activo = TRUE
              AND bm.id IS NULL
            `,
            {
                replacements: [bimestreVigenteNum, usuarioId, usuarioId, asignacionId],
                type: sequelize.QueryTypes.INSERT,
                transaction,
            },
        );
    }

    /** Ids de bimestre_matricula activos del curso en un bimestre. @returns {Promise<number[]>} */
    async listarBimestresMatriculaIdsCurso(asignacionId, bimestreNumero) {
        const rows = await sequelize.query(
            `
            SELECT bm.id
            FROM bimestres_matricula bm
            INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
              AND mm.deleted_at IS NULL AND mm.activo = TRUE
            INNER JOIN asignaciones_docentes ad ON ad.oferta_curso_id = mm.oferta_curso_id
              AND ad.deleted_at IS NULL AND ad.activo = TRUE
            WHERE ad.id = ?
              AND bm.bimestre = ?
              AND bm.deleted_at IS NULL
              AND bm.activo = TRUE
            `,
            { replacements: [asignacionId, bimestreNumero], type: sequelize.QueryTypes.SELECT },
        );
        return rows.map((r) => Number(r.id));
    }

    /** Componentes calculados del bimestre. @returns {Promise<void>} */
    async actualizarComponentesBimestreMatricula(bimestreMatriculaId, { teorico, practico, bimestre }, usuarioId, { transaction } = {}) {
        await sequelize.query(
            `
            UPDATE bimestres_matricula
            SET
              nota_teorico = ?,
              nota_practico = ?,
              nota_bimestre = ?,
              updated_by = ?,
              updated_at = NOW()
            WHERE id = ?
              AND deleted_at IS NULL
            `,
            {
                replacements: [teorico, practico, bimestre, usuarioId, bimestreMatriculaId],
                type: sequelize.QueryTypes.UPDATE,
                transaction,
            },
        );
    }

    /** @returns {Promise<Object|null>} */
    async obtenerBimestreMatriculaPorId(bimestreMatriculaId) {
        const rows = await sequelize.query(
            `
            SELECT
              nota_teorico,
              nota_practico,
              nota_bimestre,
              habilitacion_teorico,
              habilitacion_practico,
              fecha_habilitacion
            FROM bimestres_matricula
            WHERE id = ?
              AND deleted_at IS NULL
            LIMIT 1
            `,
            { replacements: [bimestreMatriculaId], type: sequelize.QueryTypes.SELECT },
        );
        return rows[0] ?? null;
    }

    /** Carga administrativa rápida: habilitación por componente + nota_bimestre efectiva. @returns {Promise<void>} */
    async actualizarHabilitacionBimestreMatricula(
        bimestreMatriculaId,
        { habilitacionTeorico, habilitacionPractico, notaBimestre, fechaHabilitacion },
        usuarioId,
        { transaction } = {},
    ) {
        await sequelize.query(
            `
            UPDATE bimestres_matricula
            SET
              habilitacion_teorico = ?,
              habilitacion_practico = ?,
              nota_bimestre = ?,
              fecha_habilitacion = COALESCE(?, fecha_habilitacion, CURDATE()),
              updated_by = ?,
              updated_at = NOW()
            WHERE id = ?
              AND deleted_at IS NULL
            `,
            {
                replacements: [
                    habilitacionTeorico,
                    habilitacionPractico,
                    notaBimestre,
                    fechaHabilitacion ?? null,
                    usuarioId,
                    bimestreMatriculaId,
                ],
                type: sequelize.QueryTypes.UPDATE,
                transaction,
            },
        );
    }
}

export default SubjectEnrollmentBimesterRepository;
