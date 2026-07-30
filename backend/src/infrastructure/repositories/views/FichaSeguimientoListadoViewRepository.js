import { sequelize } from '../../database/sequelize.js';
import { IFichaSeguimientoListadoViewRepository } from '../../../domain/interfaces/repositories/IFichaSeguimientoListadoViewRepository.js';

/**
 * Lecturas del listado de fichas de seguimiento en clase (módulo DOC ·
 * supervisión docente).
 *
 * Consume la vista SQL `vista_supervision_fichas_listado` (174): 1 fila por
 * ficha vigente con contexto de la asignación observada (vista 51), evaluador
 * resuelto desde `usuarios` y resultado derivado (docs_completos «n/4» +
 * asistentes/en planilla). SIN los TEXT de observaciones (viven en la tabla
 * raíz, FichaSeguimientoClaseRepository).
 *
 * El wrapper self «mis fichas» del docente es WHERE docente_id = ? sobre la
 * misma vista, no una vista aparte.
 *
 * Repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class FichaSeguimientoListadoViewRepository extends IFichaSeguimientoListadoViewRepository {
  /**
   * Listado paginado de fichas (vista 174): COUNT + SELECT con mismo WHERE.
   *
   * @param {Object} filters - { search, docenteId, gestionId, fechaDesde, fechaHasta }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findListado(filters = {}, page = 1, limit = 50) {
    const whereConditions = [];
    const replacements = [];

    if (filters.docenteId) {
      whereConditions.push('docente_id = ?');
      replacements.push(filters.docenteId);
    }
    if (filters.gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(filters.gestionId);
    }
    if (filters.fechaDesde) {
      whereConditions.push('fecha_seguimiento >= ?');
      replacements.push(filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      whereConditions.push('fecha_seguimiento <= ?');
      replacements.push(filters.fechaHasta);
    }
    if (filters.search) {
      whereConditions.push(
        '(docente_nombre LIKE ? OR asignatura_nombre LIKE ? OR evaluador_nombre LIKE ? OR carrera_nombre LIKE ?)'
      );
      const like = `%${filters.search}%`;
      replacements.push(like, like, like, like);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) AS total FROM vista_supervision_fichas_listado ${whereClause}`;
    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `
      SELECT *
      FROM vista_supervision_fichas_listado
      ${whereClause}
      ORDER BY fecha_seguimiento DESC, id DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limitNum, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return { rows, total };
  }

  /**
   * Fila de UNA ficha desde la vista 174 (contexto de cabecera), o null.
   *
   * @param {number} fichaId
   * @returns {Promise<Object|null>}
   */
  async findListadoById(fichaId) {
    const rows = await sequelize.query(
      'SELECT * FROM vista_supervision_fichas_listado WHERE id = :fichaId',
      {
        replacements: { fichaId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return rows[0] ?? null;
  }
}
