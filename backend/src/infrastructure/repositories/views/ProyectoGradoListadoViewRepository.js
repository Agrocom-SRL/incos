import { sequelize } from '../../database/sequelize.js';
import { IProyectoGradoListadoViewRepository } from '../../../domain/interfaces/repositories/IProyectoGradoListadoViewRepository.js';

/**
 * Lecturas de listado y ficha de proyectos de grado (módulo TUT · titulación).
 *
 * Consume las vistas SQL:
 * - `vista_tutoria_proyectos_listado` (160): 1 fila por proyecto + agregados
 *   (cantidad_integrantes, ultima_tutoria_fecha, observaciones_pendientes,
 *   porcentaje_avance, avances_pendientes).
 * - `vista_base_tutoria_proyecto_integrante_fila` (159): 1 fila por integrante.
 * - `vista_base_tutoria_bitacora_mensual_tutor` (163): reporte mensual DDE.
 *
 * La bandeja del tutor ("mis tutorados") es WHERE tutor_id = ? sobre la 160,
 * no una vista aparte.
 *
 * Repositorio de SOLO LECTURA (arquetipo B / `views/`).
 */
export class ProyectoGradoListadoViewRepository extends IProyectoGradoListadoViewRepository {
  /**
   * Listado paginado de proyectos (vista 160): COUNT + SELECT con mismo WHERE.
   *
   * @param {Object} filters - { search, gestionId, carreraId, modalidadId, estado, tutorId }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findListado(filters = {}, page = 1, limit = 50) {
    const whereConditions = [];
    const replacements = [];

    if (filters.gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(filters.gestionId);
    }
    if (filters.carreraId) {
      whereConditions.push('carrera_id = ?');
      replacements.push(filters.carreraId);
    }
    if (filters.modalidadId) {
      whereConditions.push('modalidad_id = ?');
      replacements.push(filters.modalidadId);
    }
    if (filters.estado) {
      whereConditions.push('proyecto_estado = ?');
      replacements.push(filters.estado);
    }
    if (filters.tutorId) {
      whereConditions.push('tutor_id = ?');
      replacements.push(filters.tutorId);
    }
    if (filters.search) {
      whereConditions.push('(titulo LIKE ? OR tutor_nombre LIKE ?)');
      const like = `%${filters.search}%`;
      replacements.push(like, like);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countQuery = `SELECT COUNT(*) AS total FROM vista_tutoria_proyectos_listado ${whereClause}`;
    const countResult = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total ?? 0);

    const dataQuery = `
      SELECT *
      FROM vista_tutoria_proyectos_listado
      ${whereClause}
      ORDER BY proyecto_grado_id DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await sequelize.query(dataQuery, {
      replacements: [...replacements, limitNum, offset],
      type: sequelize.QueryTypes.SELECT,
    });

    return { rows, total };
  }

  /**
   * Fila de UN proyecto desde la vista 160, o null.
   *
   * @param {number} proyectoGradoId
   * @returns {Promise<Object|null>}
   */
  async findListadoById(proyectoGradoId) {
    const rows = await sequelize.query(
      'SELECT * FROM vista_tutoria_proyectos_listado WHERE proyecto_grado_id = :proyectoGradoId',
      {
        replacements: { proyectoGradoId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    return rows[0] ?? null;
  }

  /**
   * Integrantes del proyecto (vista 159), TITULAR primero.
   *
   * @param {number} proyectoGradoId
   * @returns {Promise<Array<Object>>}
   */
  async findIntegrantesByProyectoId(proyectoGradoId) {
    return sequelize.query(
      `SELECT *
       FROM vista_base_tutoria_proyecto_integrante_fila
       WHERE proyecto_grado_id = :proyectoGradoId
       ORDER BY FIELD(integrante_rol, 'TITULAR', 'INTEGRANTE'), estudiante_nombre`,
      {
        replacements: { proyectoGradoId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  /**
   * Filas de la vista 159 donde el estudiante es integrante ACTIVO.
   *
   * @param {number} estudianteId
   * @returns {Promise<Array<Object>>}
   */
  async findIntegranteRowsByEstudianteId(estudianteId) {
    return sequelize.query(
      `SELECT *
       FROM vista_base_tutoria_proyecto_integrante_fila
       WHERE estudiante_id = :estudianteId
         AND integrante_estado = 'ACTIVO'
       ORDER BY proyecto_grado_id DESC`,
      {
        replacements: { estudianteId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  /**
   * Reporte mensual de bitácora por tutor (vista 163).
   *
   * @param {Object} params - { mes: 'YYYY-MM', gestionId, tutorId }
   * @returns {Promise<Array<Object>>}
   */
  async findBitacoraMensual({ mes, gestionId, tutorId } = {}) {
    const whereConditions = [];
    const replacements = [];

    if (mes) {
      whereConditions.push('mes = ?');
      replacements.push(mes);
    }
    if (gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(gestionId);
    }
    if (tutorId) {
      whereConditions.push('tutor_id = ?');
      replacements.push(tutorId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    return sequelize.query(
      `SELECT *
       FROM vista_base_tutoria_bitacora_mensual_tutor
       ${whereClause}
       ORDER BY tutor_nombre, carrera_nombre, mes`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }
}
