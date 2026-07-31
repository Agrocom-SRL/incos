import { sequelize } from '../../database/sequelize.js';
import { ITutoriaAvanceViewRepository } from '../../../domain/interfaces/repositories/ITutoriaAvanceViewRepository.js';

/**
 * Lecturas de las 3 extensiones del módulo TIT · titulación (2026-07-31):
 * formulario de elección de modalidad de graduación (Requisito 1), reporte
 * de avance de tutorías por carrera (Requisito 2) y planilla de avance
 * "10 en 10" de 3er año (Requisito 3).
 *
 * Consume las vistas SQL:
 * - `vista_base_tutoria_estudiante_tercer_anio` (178): roster de 3er año.
 * - `vista_tutoria_avance_carrera` (179): resumen agregado por carrera.
 * - `vista_tutoria_planilla_avance_tercer_anio` (181): roster por bimestre.
 *
 * Repositorio de SOLO LECTURA (arquetipo B / `views/`), aislado de
 * `ProyectoGradoListadoViewRepository` (SRP).
 */
export class TutoriaAvanceViewRepository extends ITutoriaAvanceViewRepository {
  /**
   * Estudiantes de 3er año elegibles para elegir modalidad de graduación
   * (vista 178, proyecto_grado_id IS NULL). Paginado: COUNT + SELECT con el
   * mismo WHERE (patrón `ProyectoGradoListadoViewRepository.findListado`).
   *
   * @param {Object} filters - { carreraId, gestionId, search }
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{rows: Array<Object>, total: number}>}
   */
  async findEstudiantesElegibles({ carreraId, gestionId, search } = {}, page = 1, limit = 50) {
    const whereConditions = ['proyecto_grado_id IS NULL'];
    const replacements = [];

    if (carreraId) {
      whereConditions.push('carrera_id = ?');
      replacements.push(carreraId);
    }
    if (gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(gestionId);
    }
    if (search) {
      whereConditions.push('(estudiante_nombre_completo LIKE ? OR ci LIKE ?)');
      const like = `%${search}%`;
      replacements.push(like, like);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(10000, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await sequelize.query(
      `SELECT COUNT(*) AS total FROM vista_base_tutoria_estudiante_tercer_anio ${whereClause}`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );
    const total = Number(countResult[0]?.total ?? 0);

    const rows = await sequelize.query(
      `SELECT *
       FROM vista_base_tutoria_estudiante_tercer_anio
       ${whereClause}
       ORDER BY apellido_paterno, apellido_materno, nombres
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, limitNum, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return { rows, total };
  }

  /**
   * Resumen agregado de avance de tutorías por carrera (vista 179).
   *
   * @param {Object} filters - { gestionId, carreraId }
   * @returns {Promise<Array<Object>>}
   */
  async findAvancePorCarrera({ gestionId, carreraId } = {}) {
    const whereConditions = [];
    const replacements = [];

    if (gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(gestionId);
    }
    if (carreraId) {
      whereConditions.push('carrera_id = ?');
      replacements.push(carreraId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    return sequelize.query(
      `SELECT *
       FROM vista_tutoria_avance_carrera
       ${whereClause}
       ORDER BY carrera_nombre`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  /**
   * Roster de 3er año con proyecto por bimestre (vista 181), ordenado en
   * orden institucional (apellido paterno, apellido materno, nombres).
   *
   * @param {Object} filters - { carreraId, gestionId, bimestre }
   * @returns {Promise<Array<Object>>}
   */
  async findPlanillaAvanceTercerAnio({ carreraId, gestionId, bimestre } = {}) {
    const whereConditions = [];
    const replacements = [];

    if (carreraId) {
      whereConditions.push('carrera_id = ?');
      replacements.push(carreraId);
    }
    if (gestionId) {
      whereConditions.push('gestion_id = ?');
      replacements.push(gestionId);
    }
    if (bimestre) {
      whereConditions.push('bimestre = ?');
      replacements.push(bimestre);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    return sequelize.query(
      `SELECT *
       FROM vista_tutoria_planilla_avance_tercer_anio
       ${whereClause}
       ORDER BY apellido_paterno, apellido_materno, nombres`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }
}
