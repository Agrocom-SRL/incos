import { sequelize } from '../../database/sequelize.js';
import { DASHBOARD_QUERY_TARGETS } from '../../constants/dashboardQuery.targets.js';
import { IDashboardRepository } from '../../../domain/interfaces/repositories/IDashboardRepository.js';

const { vistaActividadesRecientes, vistaDocentePanel, vistaEstudiantePanel, tablaEstudiantes } =
  DASHBOARD_QUERY_TARGETS;

/**
 * Consultas agregadas para el resumen del panel principal (dashboard).
 * Repositorio de SOLO LECTURA sobre vistas (arquetipo views/).
 */
export class DashboardRepository extends IDashboardRepository {
  /**
   * Actividades recientes: prioriza las de la fecha de hoy y luego por ocurrido_en descendente.
   *
   * @param {number} limit - Máximo de filas (1–100)
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findActividadesRecientes(limit = 12) {
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const query = `
      SELECT
        artefacto_tipo,
        artefacto_id,
        link_path,
        titulo,
        detalle,
        avatar_seed,
        ocurrido_en
      FROM ${vistaActividadesRecientes}
      ORDER BY (DATE(ocurrido_en) = CURDATE()) DESC, ocurrido_en DESC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Estudiantes registrados (fila creada) hoy y en el mes calendario actual.
   *
   * @returns {Promise<{ hoy: number, mes: number }>}
   */
  async countEstudiantesRegistradosHoyYMes() {
    const query = `
      SELECT
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS hoy,
        SUM(
          CASE
            WHEN YEAR(created_at) = YEAR(CURDATE())
             AND MONTH(created_at) = MONTH(CURDATE())
            THEN 1 ELSE 0
          END
        ) AS mes
      FROM ${tablaEstudiantes}
      WHERE deleted_at IS NULL
        AND activo = TRUE
    `;
    const rows = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    const row = rows[0] || {};
    return {
      hoy: Number(row.hoy ?? 0),
      mes: Number(row.mes ?? 0),
    };
  }

  /**
   * Docentes activos más recientemente registrados.
   *
   * @param {number} limit
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findDocentesRecientes(limit = 10) {
    const lim = Math.min(30, Math.max(1, parseInt(limit, 10) || 10));
    const query = `
      SELECT
        id,
        nombre_completo,
        titulo_profesional,
        avatar_seed
      FROM ${vistaDocentePanel}
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Estudiantes activos más recientemente registrados.
   *
   * @param {number} limit
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  /**
   * Carreras activas para vista previa del panel (solo lectura; sin ABM).
   * Expuesto vía GET /dashboard/resumen bajo `sistema.catalogo.referencia`.
   *
   * @param {number} limit
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findCarrerasDestacadas(limit = 10) {
    const lim = Math.min(20, Math.max(1, parseInt(limit, 10) || 10));
    const query = `
      SELECT
        id,
        codigo,
        nombre,
        color_hex,
        imagen_ruta
      FROM carreras
      WHERE deleted_at IS NULL
        AND activo = TRUE
      ORDER BY nombre ASC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }

  async findEstudiantesRecientes(limit = 10) {
    const lim = Math.min(30, Math.max(1, parseInt(limit, 10) || 10));
    const query = `
      SELECT
        id,
        nombre_completo,
        codigo_estudiante,
        avatar_seed
      FROM ${vistaEstudiantePanel}
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
