import { sequelize } from '../../database/sequelize.js';
import { IGrupoCapacitacionListadoViewRepository } from '../../../domain/interfaces/repositories/IGrupoCapacitacionListadoViewRepository.js';

/**
 * Lecturas del listado de grupos de capacitación (módulo CAP).
 *
 * Consume las vistas SQL `vista_grupos_capacitacion_listado` (190, 1 fila por
 * grupo) y `vista_base_cursos_capacitacion_horarios` (154, bloques del grupo).
 *
 * Repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class GrupoCapacitacionListadoViewRepository extends IGrupoCapacitacionListadoViewRepository {
  /**
   * Listado paginado de grupos (vista 190): COUNT + SELECT con el mismo WHERE.
   *
   * @param {Object} filters - { search, cursoId, includeInactiveCursos }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findListado(filters = {}, page = 1, limit = 50) {
    const whereConditions = [];
    const replacements = [];

    if (!filters.includeInactiveCursos) {
      whereConditions.push('curso_activo = TRUE');
    }
    if (filters.cursoId) {
      whereConditions.push('curso_id = ?');
      replacements.push(filters.cursoId);
    }
    if (filters.search) {
      whereConditions.push('(nombre LIKE ? OR curso_titulo LIKE ?)');
      const like = `%${filters.search}%`;
      replacements.push(like, like);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await sequelize.query(
      `SELECT COUNT(*) AS total FROM vista_grupos_capacitacion_listado ${whereClause}`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );
    const total = Number(countResult[0]?.total ?? 0);

    const rows = await sequelize.query(
      `SELECT *
       FROM vista_grupos_capacitacion_listado
       ${whereClause}
       ORDER BY curso_titulo ASC, orden ASC, grupo_id ASC
       LIMIT ? OFFSET ?`,
      { replacements: [...replacements, limitNum, offset], type: sequelize.QueryTypes.SELECT }
    );

    return { rows, total };
  }

  /**
   * Horarios de varios grupos (vista 154), ordenados por día y hora.
   *
   * @param {number[]} grupoIds
   * @returns {Promise<Array<Object>>}
   */
  async findHorariosByGrupoIds(grupoIds) {
    if (!Array.isArray(grupoIds) || grupoIds.length === 0) return [];
    return sequelize.query(
      `SELECT grupo_id, horario_id, bloque_etiqueta
       FROM vista_base_cursos_capacitacion_horarios
       WHERE grupo_id IN (:grupoIds)
       ORDER BY grupo_id ASC, dia_orden ASC, hora_inicio ASC`,
      { replacements: { grupoIds }, type: sequelize.QueryTypes.SELECT }
    );
  }
}
