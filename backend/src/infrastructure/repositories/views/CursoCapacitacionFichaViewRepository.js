import { sequelize } from '../../database/sequelize.js';
import { ICursoCapacitacionFichaViewRepository } from '../../../domain/interfaces/repositories/ICursoCapacitacionFichaViewRepository.js';

/**
 * Lecturas de listado y ficha de cursos de capacitación (módulo CAP).
 *
 * Consume las vistas SQL:
 * - `vista_cursos_capacitacion_listado` (155): 1 fila por curso + resumen de aulas de sus grupos +
 *   inscritos_count + cupo_disponible + horarios_count + horarios_detalle.
 *   Incluye `activo` (soporta incluirInactivos); solo excluye soft-deleted.
 * - `vista_base_cursos_capacitacion_horarios` (154): 1 fila por bloque del
 *   curso, con bloque_etiqueta ("LUN 19:00-21:00") y dia_orden.
 *
 * Repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class CursoCapacitacionFichaViewRepository extends ICursoCapacitacionFichaViewRepository {
  /**
   * Listado paginado de cursos (vista 155): COUNT + SELECT con el mismo WHERE.
   *
   * @param {Object} filters - { search, estado, includeInactive }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findListado(filters = {}, page = 1, limit = 50) {
    const whereConditions = [];
    const replacements = [];

    if (!filters.includeInactive) {
      whereConditions.push('activo = TRUE');
    }
    if (filters.estado) {
      whereConditions.push('estado = ?');
      replacements.push(filters.estado);
    }
    if (filters.search) {
      whereConditions.push('(titulo LIKE ? OR descripcion LIKE ?)');
      const like = `%${filters.search}%`;
      replacements.push(like, like);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) AS total FROM vista_cursos_capacitacion_listado ${whereClause}`;
    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `
      SELECT *
      FROM vista_cursos_capacitacion_listado
      ${whereClause}
      ORDER BY fecha_inicio DESC, id DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limitNum, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return { rows, total };
  }

  /**
   * Fila de UN curso desde la vista 155 (incluye inactivos), o null.
   *
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async findListadoById(id) {
    const rows = await sequelize.query(
      'SELECT * FROM vista_cursos_capacitacion_listado WHERE id = :id',
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return rows[0] ?? null;
  }

  /**
   * Bloques horarios del curso (vista 154), ordenados por día y hora.
   *
   * @param {number} capacitacionId
   * @returns {Promise<Array<Object>>}
   */
  async findHorariosByCapacitacionId(capacitacionId) {
    return sequelize.query(
      `SELECT *
       FROM vista_base_cursos_capacitacion_horarios
       WHERE capacitacion_id = :capacitacionId
       ORDER BY dia_orden ASC, hora_inicio ASC`,
      {
        replacements: { capacitacionId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }
}
