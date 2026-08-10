import { sequelize } from '../../database/sequelize.js';
import { ITutoriaAvanceViewRepository } from '../../../domain/interfaces/repositories/ITutoriaAvanceViewRepository.js';

/**
 * Lecturas de las extensiones del módulo TIT · titulación: formulario de
 * elección de modalidad de graduación (Requisito 1), reporte de avance de
 * tutorías por carrera (Requisito 2) y seguimiento de tutorías a docentes
 * (2026-08-10, reemplaza la planilla de avance "10 en 10" de 3er año).
 *
 * Consume las vistas SQL:
 * - `vista_base_tutoria_estudiante_tercer_anio` (178): roster de 3er año.
 * - `vista_tutoria_avance_carrera` (179): resumen agregado por carrera.
 * - `vista_tutoria_seguimiento_docentes` (181): roster de tutoriados
 *   ACTIVOS por docente-tutor.
 * - `vista_base_tutoria_bitacora_mes_fila` (180): bitácora por año/mes,
 *   agregada aquí (LEFT JOIN, colapsada a un mes puntual) para el
 *   seguimiento a docentes — misma fuente para el tablero en pantalla y
 *   para la exportación Excel (agrupada por carrera en el use case).
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
   * Roster de tutoriados ACTIVOS por docente-tutor (vista 181), con el
   * agregado mensual de bitácora (vista 180) resuelto aquí mediante LEFT
   * JOIN filtrado por año/mes: el roster (vista 181) NO tiene dimensión
   * temporal, así que el filtro año/mes vive en el subquery sobre la 180,
   * garantizando que un tutoriado sin bitácora en el mes consultado siga
   * apareciendo con 0/NULL (hallazgo de incumplimiento relevante para
   * Dirección Académica), en vez de desaparecer del reporte.
   *
   * Texto (actividad/observaciones) resuelto con subconsulta correlacionada
   * (no GROUP_CONCAT, para evitar truncado de `group_concat_max_len`); el
   * conteo/porcentaje numérico sí usa agregación simple. Trae DOS conteos
   * del mes: `total_tutorias_mes` (toda entrada de bitácora, REUNION +
   * REVISION_AVANCE — "Nro TUTORIAS EN EL MES" de la planilla física) y
   * `tutorias_ejecutadas_mes` (solo REUNION, sesiones de tutoría realmente
   * realizadas — "Nro. TUTORÍAS DESARROLLADAS EN EL MES").
   *
   * @param {Object} filters - { docenteId, carreraId, anio, mes }
   * @returns {Promise<Array<Object>>}
   */
  async findSeguimientoTutoriaDocentes({ docenteId, carreraId, anio, mes } = {}) {
    const whereConditions = [];
    const replacements = { anio, mes };

    if (docenteId) {
      whereConditions.push('roster.tutor_id = :docenteId');
      replacements.docenteId = docenteId;
    }
    if (carreraId) {
      whereConditions.push('roster.carrera_id = :carreraId');
      replacements.carreraId = carreraId;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    return sequelize.query(
      `SELECT
         roster.*,
         COALESCE(mensual.total_tutorias_mes, 0) AS total_tutorias_mes,
         COALESCE(mensual.tutorias_ejecutadas_mes, 0) AS tutorias_ejecutadas_mes,
         mensual.ultimo_porcentaje_avance AS porcentaje_avance,
         (
           SELECT bb2.actividad
           FROM vista_base_tutoria_bitacora_mes_fila bb2
           WHERE bb2.proyecto_grado_id = roster.proyecto_grado_id
             AND bb2.anio = :anio AND bb2.mes = :mes
           ORDER BY bb2.fecha DESC, bb2.bitacora_id DESC
           LIMIT 1
         ) AS ultima_actividad,
         (
           SELECT bb3.observaciones
           FROM vista_base_tutoria_bitacora_mes_fila bb3
           WHERE bb3.proyecto_grado_id = roster.proyecto_grado_id
             AND bb3.anio = :anio AND bb3.mes = :mes
           ORDER BY bb3.fecha DESC, bb3.bitacora_id DESC
           LIMIT 1
         ) AS ultima_observacion
       FROM vista_tutoria_seguimiento_docentes roster
       LEFT JOIN (
         SELECT
           bb.proyecto_grado_id AS proyecto_grado_id,
           COUNT(*) AS total_tutorias_mes,
           SUM(CASE WHEN bb.tipo = 'REUNION' THEN 1 ELSE 0 END) AS tutorias_ejecutadas_mes,
           SUBSTRING_INDEX(GROUP_CONCAT(bb.porcentaje_avance ORDER BY bb.fecha DESC, bb.bitacora_id DESC), ',', 1) AS ultimo_porcentaje_avance
         FROM vista_base_tutoria_bitacora_mes_fila bb
         WHERE bb.anio = :anio AND bb.mes = :mes
         GROUP BY bb.proyecto_grado_id
       ) mensual ON mensual.proyecto_grado_id = roster.proyecto_grado_id
       ${whereClause}
       ORDER BY roster.carrera_nombre, roster.tutor_nombre, roster.apellido_paterno, roster.apellido_materno, roster.nombres`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }
}
