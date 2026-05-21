import { sequelize } from '../database/sequelize.js';

/**
 * Contexto académico vigente y periodos bimestre (vistas 103, 105).
 */
export class CalificacionContextoRepository {
  /**
   * @returns {Promise<{ gestion_id, gestion_anio, gestion_nombre, bimestre_vigente, bimestre_nombre }|null>}
   */
  async obtenerContextoVigente() {
    const rows = await sequelize.query(`SELECT * FROM vista_calificacion_contexto_vigente`, {
      type: sequelize.QueryTypes.SELECT,
    });
    return rows[0] ?? null;
  }

  /**
   * @param {number} gestionId
   */
  async obtenerPeriodosBimestresGestion(gestionId) {
    return sequelize.query(
      `
      SELECT
        numero_orden,
        nombre,
        fecha_inicio,
        fecha_fin,
        color_hex,
        estado_calendario
      FROM vista_base_calificacion_periodos_bimestre
      WHERE gestion_id = ?
      ORDER BY numero_orden ASC
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /**
   * @param {number} gestionAnio
   * @returns {Promise<{ id, anio, nombre }|null>}
   */
  async obtenerGestionAnteriorPorAnio(gestionAnio) {
    const rows = await sequelize.query(
      `
      SELECT g.id, g.anio, g.nombre
      FROM gestiones g
      WHERE g.activo = TRUE
        AND g.deleted_at IS NULL
        AND g.anio < ?
      ORDER BY g.anio DESC, g.id DESC
      LIMIT 1
      `,
      { replacements: [gestionAnio], type: sequelize.QueryTypes.SELECT },
    );
    return rows[0] ?? null;
  }
}
