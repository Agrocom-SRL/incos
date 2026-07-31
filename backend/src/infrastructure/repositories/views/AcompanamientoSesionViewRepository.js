import { sequelize } from '../../database/sequelize.js';
import { IAcompanamientoSesionViewRepository } from '../../../domain/interfaces/repositories/IAcompanamientoSesionViewRepository.js';

/**
 * Lecturas de sesiones de refuerzo (módulo ACA · acompañamiento).
 *
 * Consume las vistas SQL:
 * - `vista_base_acompanamiento_sesion_fila` (161): 1 fila por sesión con
 *   curso/docente/materia/paralelo + agregados de estudiantes.
 * - `vista_acompanamiento_sesiones_resumen` (162): agregado mensual/carrera.
 * - estudiantes de UNA sesión: sesion_refuerzo_estudiantes ⋈
 *   vista 156 (datos del estudiante y sus notas en la materia reforzada;
 *   reutiliza la vista de riesgo, no duplica joins).
 *
 * Repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class AcompanamientoSesionViewRepository extends IAcompanamientoSesionViewRepository {
  /**
   * Listado paginado de sesiones (vista 161): COUNT + SELECT con mismo WHERE.
   *
   * @param {Object} filters - { search, gestionId, docenteId,
   *   asignacionDocenteId, estado, modalidad }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findSesiones(filters = {}, page = 1, limit = 50) {
    const whereConditions = [];
    const replacements = [];

    if (filters.gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(filters.gestionId);
    }
    if (filters.docenteId) {
      whereConditions.push('docente_id = ?');
      replacements.push(filters.docenteId);
    }
    if (filters.asignacionDocenteId) {
      whereConditions.push('asignacion_docente_id = ?');
      replacements.push(filters.asignacionDocenteId);
    }
    if (filters.estado) {
      whereConditions.push('estado = ?');
      replacements.push(filters.estado);
    }
    if (filters.modalidad) {
      whereConditions.push('modalidad = ?');
      replacements.push(filters.modalidad);
    }
    if (filters.search) {
      whereConditions.push('(tema LIKE ? OR materia_nombre LIKE ? OR docente_nombre LIKE ?)');
      const like = `%${filters.search}%`;
      replacements.push(like, like, like);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) AS total FROM vista_base_acompanamiento_sesion_fila ${whereClause}`;
    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `
      SELECT *
      FROM vista_base_acompanamiento_sesion_fila
      ${whereClause}
      ORDER BY fecha DESC, hora_inicio DESC, sesion_id DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limitNum, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return { rows, total };
  }

  /**
   * Fila de UNA sesión desde la vista 161, o null.
   *
   * @param {number} sesionId
   * @returns {Promise<Object|null>}
   */
  async findSesionById(sesionId) {
    const rows = await sequelize.query(
      'SELECT * FROM vista_base_acompanamiento_sesion_fila WHERE sesion_id = :sesionId',
      {
        replacements: { sesionId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return rows[0] ?? null;
  }

  /**
   * Estudiantes vigentes de la sesión con sus datos y sus notas
   * en la materia reforzada (LEFT JOIN a la vista 156 por matricula_materia_id).
   *
   * @param {number} sesionId
   * @returns {Promise<Array<Object>>}
   */
  async findEstudiantesBySesionId(sesionId) {
    return sequelize.query(
      `SELECT
         se.id                    AS sesion_refuerzo_estudiante_id,
         se.sesion_refuerzo_id    AS sesion_refuerzo_id,
         se.matricula_materia_id  AS matricula_materia_id,
         se.origen                AS origen,
         se.asistio               AS asistio,
         se.progreso              AS progreso,
         se.observaciones         AS observaciones,
         r.estudiante_id          AS estudiante_id,
         r.codigo_estudiante      AS codigo_estudiante,
         r.nombre_completo        AS nombre_completo,
         r.nota_ultimo_bimestre   AS nota_ultimo_bimestre,
         r.promedio_anual         AS promedio_anual,
         r.en_riesgo              AS en_riesgo
       FROM sesion_refuerzo_estudiantes se
       LEFT JOIN vista_base_acompanamiento_riesgo_fila r
         ON r.matricula_materia_id = se.matricula_materia_id
       WHERE se.sesion_refuerzo_id = :sesionId
         AND se.activo = TRUE
         AND se.deleted_at IS NULL
       ORDER BY r.nombre_completo, se.id`,
      {
        replacements: { sesionId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  /**
   * Resumen mensual por carrera (vista 162).
   *
   * @param {number|null} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findResumenMensual(gestionId = null) {
    const whereClause = gestionId ? 'WHERE gestion_id = ?' : '';
    return sequelize.query(
      `SELECT *
       FROM vista_acompanamiento_sesiones_resumen
       ${whereClause}
       ORDER BY mes, carrera_nombre`,
      {
        replacements: gestionId ? [gestionId] : [],
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }
}
