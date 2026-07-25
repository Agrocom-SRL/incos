import { sequelize } from '../../database/sequelize.js';
import { IRiesgoAcademicoViewRepository } from '../../../domain/interfaces/repositories/IRiesgoAcademicoViewRepository.js';

/**
 * Lecturas de riesgo pedagógico (módulo TUT · acompañamiento).
 *
 * Consume las vistas SQL calculadas (el riesgo NO es tabla):
 * - `vista_base_acompanamiento_riesgo_fila` (156): estudiante × materia con
 *   umbral parametrizable y flag en_riesgo.
 * - `vista_acompanamiento_riesgo_carrera` (157): agregado por gestión/carrera.
 * - `vista_acompanamiento_reprobacion_materia` (158): agregado por materia.
 *
 * Repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class RiesgoAcademicoViewRepository extends IRiesgoAcademicoViewRepository {
  /**
   * Listado paginado de alertas (vista 156): COUNT + SELECT con mismo WHERE.
   *
   * @param {Object} filters - { search, gestionId, carreraId, paraleloGestionId,
   *   docenteId, soloEnRiesgo }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findAlertas(filters = {}, page = 1, limit = 50) {
    const whereConditions = [];
    const replacements = [];

    if (filters.soloEnRiesgo !== false) {
      whereConditions.push('en_riesgo = 1');
    }
    if (filters.gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(filters.gestionId);
    }
    if (filters.carreraId) {
      whereConditions.push('carrera_id = ?');
      replacements.push(filters.carreraId);
    }
    if (filters.paraleloGestionId) {
      whereConditions.push('paralelo_gestion_id = ?');
      replacements.push(filters.paraleloGestionId);
    }
    if (filters.asignacionDocenteIds && filters.asignacionDocenteIds.length > 0) {
      whereConditions.push(
        `asignacion_docente_id IN (${filters.asignacionDocenteIds.map(() => '?').join(', ')})`
      );
      replacements.push(...filters.asignacionDocenteIds);
    }
    if (filters.docenteId) {
      // La vista 156 no expone docente_id: se acota por las asignaciones
      // vigentes del docente (cadena académica, sin duplicar joins en JS).
      whereConditions.push(
        `asignacion_docente_id IN (
          SELECT ad.id FROM asignaciones_docentes ad
          WHERE ad.docente_id = ? AND ad.deleted_at IS NULL AND ad.activo = TRUE AND ad.vigente = TRUE
        )`
      );
      replacements.push(filters.docenteId);
    }
    if (filters.search) {
      whereConditions.push(
        '(nombre_completo LIKE ? OR codigo_estudiante LIKE ? OR asignatura_nombre LIKE ? OR asignatura_sigla LIKE ?)'
      );
      const like = `%${filters.search}%`;
      replacements.push(like, like, like, like);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) AS total FROM vista_base_acompanamiento_riesgo_fila ${whereClause}`;
    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `
      SELECT *
      FROM vista_base_acompanamiento_riesgo_fila
      ${whereClause}
      ORDER BY nombre_completo, asignatura_sigla
      LIMIT ? OFFSET ?
    `;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limitNum, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return { rows, total };
  }

  /**
   * Filas de la vista 156 de UN estudiante (todas sus materias).
   *
   * @param {number} estudianteId
   * @param {Object} [filters] - { gestionId }
   * @returns {Promise<Array<Object>>}
   */
  async findByEstudianteId(estudianteId, filters = {}) {
    const whereConditions = ['estudiante_id = ?'];
    const replacements = [estudianteId];

    if (filters.gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(filters.gestionId);
    }

    return sequelize.query(
      `SELECT *
       FROM vista_base_acompanamiento_riesgo_fila
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY asignatura_sigla`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  /**
   * Agregado por carrera (vista 157).
   *
   * @param {number|null} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findResumenCarrera(gestionId = null) {
    const whereClause = gestionId ? 'WHERE gestion_id = ?' : '';
    return sequelize.query(
      `SELECT *
       FROM vista_acompanamiento_riesgo_carrera
       ${whereClause}
       ORDER BY carrera_nombre`,
      {
        replacements: gestionId ? [gestionId] : [],
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  /**
   * Agregado por materia (vista 158), ordenado por pct_riesgo DESC.
   *
   * @param {number|null} gestionId
   * @returns {Promise<Array<Object>>}
   */
  async findReprobacionMateria(gestionId = null) {
    const whereClause = gestionId ? 'WHERE gestion_id = ?' : '';
    return sequelize.query(
      `SELECT *
       FROM vista_acompanamiento_reprobacion_materia
       ${whereClause}
       ORDER BY pct_riesgo DESC, asignatura_sigla`,
      {
        replacements: gestionId ? [gestionId] : [],
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }
}
