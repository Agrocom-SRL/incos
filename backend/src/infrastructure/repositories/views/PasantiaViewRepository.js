import { sequelize } from '../../database/sequelize.js';
import { IPasantiaViewRepository } from '../../../domain/interfaces/repositories/IPasantiaViewRepository.js';

/**
 * Lecturas de listado y ficha de pasantías (módulo TUT · pasantías).
 *
 * Consume las vistas SQL:
 * - `vista_pasantias_listado` (167): 1 fila por pasantía vigente con
 *   identidad resuelta (estudiante, empresa, carrera, gestión, supervisor).
 * - `vista_pasantia_detalle` (168): ficha completa (puesto, contrato,
 *   contacto de la empresa) + agregados de informes/seguimientos.
 *
 * Los wrappers self ("mis pasantías" del docente, "mi pasantía" del
 * estudiante) son WHERE docente_supervisor_id = ? / estudiante_id = ? sobre
 * la 167, no vistas aparte.
 *
 * Repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class PasantiaViewRepository extends IPasantiaViewRepository {
  /**
   * Listado paginado de pasantías (vista 167): COUNT + SELECT con mismo WHERE.
   *
   * @param {Object} filters - { search, carreraId, gestionId, estado, tipo,
   *   docenteSupervisorId, estudianteId }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findListado(filters = {}, page = 1, limit = 50) {
    const whereConditions = [];
    const replacements = [];

    if (filters.carreraId) {
      whereConditions.push('carrera_id = ?');
      replacements.push(filters.carreraId);
    }
    if (filters.gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(filters.gestionId);
    }
    if (filters.estado) {
      whereConditions.push('estado = ?');
      replacements.push(filters.estado);
    }
    if (filters.tipo) {
      whereConditions.push('tipo = ?');
      replacements.push(filters.tipo);
    }
    if (filters.docenteSupervisorId) {
      whereConditions.push('docente_supervisor_id = ?');
      replacements.push(filters.docenteSupervisorId);
    }
    if (filters.estudianteId) {
      whereConditions.push('estudiante_id = ?');
      replacements.push(filters.estudianteId);
    }
    if (filters.search) {
      whereConditions.push(
        '(estudiante_nombre LIKE ? OR empresa_nombre LIKE ? OR docente_supervisor_nombre LIKE ?)'
      );
      const like = `%${filters.search}%`;
      replacements.push(like, like, like);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) AS total FROM vista_pasantias_listado ${whereClause}`;
    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `
      SELECT *
      FROM vista_pasantias_listado
      ${whereClause}
      ORDER BY pasantia_id DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limitNum, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return { rows, total };
  }

  /**
   * Fila de UNA pasantía desde la vista 168 (detalle), o null.
   *
   * @param {number} pasantiaId
   * @returns {Promise<Object|null>}
   */
  async findListadoById(pasantiaId) {
    const rows = await sequelize.query(
      'SELECT * FROM vista_pasantia_detalle WHERE pasantia_id = :pasantiaId',
      {
        replacements: { pasantiaId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return rows[0] ?? null;
  }
}
