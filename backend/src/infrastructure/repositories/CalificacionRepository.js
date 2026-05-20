import { sequelize } from '../database/sequelize.js';

/**
 * Acceso a datos de calificaciones.
 * La lógica de joins y reglas de negocio vive en database/03-views/:
 * - vista_calificacion_contexto_vigente (103)
 * - vista_calificacion_coordinacion_docentes (102)
 */
export class CalificacionRepository {
  /**
   * @returns {Promise<{ gestion_id, gestion_anio, gestion_nombre, bimestre_vigente, bimestre_nombre }|null>}
   */
  async obtenerContextoVigente() {
    const rows = await sequelize.query(
      `SELECT * FROM vista_calificacion_contexto_vigente`,
      { type: sequelize.QueryTypes.SELECT }
    );
    return rows[0] ?? null;
  }

  /**
   * Docentes con cursos con matrículas activas (vista 102).
   * Filtros de búsqueda y paginación en capa de aplicación (como registro de aporte).
   *
   * @param {Object} options
   * @param {boolean} [options.preliminar=false]
   * @param {string} [options.q]
   * @param {number} [options.limit=50]
   * @returns {Promise<Array<Object>>}
   */
  async listarDocentesCoordinacion(options = {}) {
    const { preliminar = false, q, limit = 50 } = options;
    const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

    if (preliminar) {
      return sequelize.query(
        `
        SELECT
          v.docente_id,
          v.docente_nombre,
          v.docente_especialidad,
          v.cantidad_cursos
        FROM vista_calificacion_coordinacion_docentes v
        ORDER BY v.cantidad_cursos DESC, v.docente_nombre ASC
        LIMIT ?
        `,
        { replacements: [lim], type: sequelize.QueryTypes.SELECT }
      );
    }

    const raw = String(q ?? '').trim();
    if (raw.length < 2) {
      return [];
    }
    const safe = raw.replace(/%/g, '').replace(/_/g, '');
    const term = `%${safe}%`;

    return sequelize.query(
      `
      SELECT
        v.docente_id,
        v.docente_nombre,
        v.docente_especialidad,
        v.cantidad_cursos
      FROM vista_calificacion_coordinacion_docentes v
      WHERE (
        COALESCE(v.docente_nombre, '') LIKE ?
        OR COALESCE(v.docente_especialidad, '') LIKE ?
      )
      ORDER BY v.cantidad_cursos DESC, v.docente_nombre ASC
      LIMIT ?
      `,
      { replacements: [term, term, lim], type: sequelize.QueryTypes.SELECT }
    );
  }
}
