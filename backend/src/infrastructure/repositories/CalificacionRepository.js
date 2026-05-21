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
   * Bimestres del calendario académico (periodos_academicos) de una gestión.
   * Estado según fechas del cronograma (misma lógica que vista_calificacion_contexto_vigente).
   * @param {number} gestionId
   */
  async obtenerPeriodosBimestresGestion(gestionId) {
    return sequelize.query(
      `
      SELECT
        pa.numero_orden,
        pa.nombre,
        pa.fecha_inicio,
        pa.fecha_fin,
        pa.color_hex,
        CASE
          WHEN CURDATE() BETWEEN pa.fecha_inicio AND pa.fecha_fin THEN 'abierto'
          WHEN CURDATE() > pa.fecha_fin THEN 'cerrado'
          ELSE 'futuro'
        END AS estado_calendario
      FROM periodos_academicos pa
      WHERE pa.gestion_id = ?
        AND pa.division = 'BIMESTRE'
        AND pa.activo = TRUE
        AND pa.deleted_at IS NULL
      ORDER BY pa.numero_orden ASC
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
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
          v.cantidad_cursos,
          v.cantidad_materias,
          v.cantidad_estudiantes,
          v.carreras_detalle
        FROM vista_calificacion_coordinacion_docentes v
        ORDER BY v.cantidad_estudiantes DESC, v.cantidad_cursos DESC, v.docente_nombre ASC
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
        v.cantidad_cursos,
        v.cantidad_materias,
        v.cantidad_estudiantes,
        v.carreras_detalle
      FROM vista_calificacion_coordinacion_docentes v
      WHERE (
        COALESCE(v.docente_nombre, '') LIKE ?
        OR COALESCE(v.docente_especialidad, '') LIKE ?
        OR COALESCE(v.carreras_detalle, '') LIKE ?
      )
      ORDER BY v.cantidad_estudiantes DESC, v.cantidad_cursos DESC, v.docente_nombre ASC
      LIMIT ?
      `,
      { replacements: [term, term, term, lim], type: sequelize.QueryTypes.SELECT }
    );
  }

  /**
   * Gestión académica inmediatamente anterior (por año).
   * @param {number} gestionAnio
   * @returns {Promise<{ id, anio, nombre }|null>}
   */
  /**
   * Ficha del docente para encabezado de Mis cursos.
   * @param {number} docenteId
   */
  async obtenerDocenteCalificaciones(docenteId) {
    const rows = await sequelize.query(
      `
      SELECT
        f.docente_id,
        TRIM(
          CONCAT_WS(
            ' ',
            f.nombres,
            f.apellido_paterno,
            f.apellido_materno
          )
        ) AS docente_nombre
      FROM vista_base_docente_ficha f
      WHERE f.docente_id = ?
        AND f.activo = TRUE
        AND f.estado_laboral = 'ACTIVO'
      LIMIT 1
      `,
      { replacements: [docenteId], type: sequelize.QueryTypes.SELECT },
    );
    return rows[0] ?? null;
  }

  /**
   * Cursos (asignaciones) del docente con matrículas activas en gestión vigente.
   * @param {number} docenteId
   * @returns {Promise<Array<Object>>}
   */
  async listarCursosPorDocente(docenteId) {
    const ctx = await this.obtenerContextoVigente();
    const bimestreVigente = ctx?.bimestre_vigente != null ? Number(ctx.bimestre_vigente) : null;

    return sequelize.query(
      `
      SELECT
        fila.asignacion_docente_id,
        adc.materia_nombre,
        adc.materia_sigla,
        adc.carrera_nombre,
        COALESCE(NULLIF(TRIM(adc.carrera_color_hex), ''), '#64748b') AS carrera_color_hex,
        adc.paralelo_nombre,
        adc.paralelo_turno,
        adc.asignatura_periodo_nombre,
        COALESCE(adc.horas_plan, adc.carga_horaria, 0) AS horas_semanales,
        ad.teorico_override,
        ad.practico_override,
        COUNT(DISTINCT fila.estudiante_id) AS cantidad_estudiantes,
        (
          SELECT COUNT(DISTINCT ev.id)
          FROM evaluaciones ev
          INNER JOIN bimestres_matricula bm ON bm.id = ev.bimestre_matricula_id
            AND bm.deleted_at IS NULL
            AND bm.activo = TRUE
          INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
            AND mm.deleted_at IS NULL
            AND mm.activo = TRUE
          WHERE mm.asignacion_docente_id = fila.asignacion_docente_id
            AND ev.deleted_at IS NULL
            AND ev.activo = TRUE
            AND (? IS NULL OR bm.bimestre = ?)
        ) AS cantidad_evaluaciones_bimestre
      FROM vista_base_calificacion_coordinacion_fila fila
      INNER JOIN vista_base_docente_asignaciones_curso adc
        ON adc.asignacion_docente_id = fila.asignacion_docente_id
        AND adc.docente_id = fila.docente_id
      INNER JOIN asignaciones_docentes ad
        ON ad.id = fila.asignacion_docente_id
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
      WHERE fila.docente_id = ?
      GROUP BY
        fila.asignacion_docente_id,
        fila.gestion_id,
        adc.materia_nombre,
        adc.materia_sigla,
        adc.carrera_nombre,
        adc.carrera_color_hex,
        adc.paralelo_nombre,
        adc.paralelo_turno,
        adc.asignatura_periodo_nombre,
        adc.horas_plan,
        adc.carga_horaria,
        ad.teorico_override,
        ad.practico_override
      ORDER BY adc.carrera_nombre ASC, adc.materia_nombre ASC, adc.paralelo_nombre ASC
      `,
      {
        replacements: [bimestreVigente, bimestreVigente, docenteId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  /**
   * Resumen por bimestre (aprobados / reprobados / evaluaciones) por asignación del docente.
   * @param {number} docenteId
   * @param {number} notaMinimaAprobacion
   * @returns {Promise<Array<Object>>}
   */
  async listarResumenBimestresCursosPorDocente(docenteId, notaMinimaAprobacion = 61) {
    const min = Number(notaMinimaAprobacion) || 61;

    return sequelize.query(
      `
      SELECT
        mm.asignacion_docente_id,
        bm.bimestre,
        COUNT(DISTINCT mm.id) AS matriculas,
        SUM(
          CASE
            WHEN COALESCE(bm.nota_habilitacion, bm.nota_bimestre) IS NOT NULL
              AND COALESCE(bm.nota_habilitacion, bm.nota_bimestre) >= ?
            THEN 1
            ELSE 0
          END
        ) AS aprobados,
        SUM(
          CASE
            WHEN COALESCE(bm.nota_habilitacion, bm.nota_bimestre) IS NOT NULL
              AND COALESCE(bm.nota_habilitacion, bm.nota_bimestre) < ?
            THEN 1
            ELSE 0
          END
        ) AS reprobados,
        SUM(
          CASE
            WHEN COALESCE(bm.nota_habilitacion, bm.nota_bimestre) IS NULL
            THEN 1
            ELSE 0
          END
        ) AS pendientes,
        SUM(CASE WHEN bm.estado = 'CERRADO' THEN 1 ELSE 0 END) AS cerrados,
        COUNT(DISTINCT ev.id) AS evaluaciones
      FROM matriculas_materia mm
      INNER JOIN bimestres_matricula bm
        ON bm.matricula_materia_id = mm.id
        AND bm.deleted_at IS NULL
        AND bm.activo = TRUE
      LEFT JOIN evaluaciones ev
        ON ev.bimestre_matricula_id = bm.id
        AND ev.deleted_at IS NULL
        AND ev.activo = TRUE
      INNER JOIN asignaciones_docentes ad
        ON ad.id = mm.asignacion_docente_id
        AND ad.docente_id = ?
        AND ad.deleted_at IS NULL
        AND ad.activo = TRUE
      WHERE mm.deleted_at IS NULL
        AND mm.activo = TRUE
        AND mm.estado IN ('INSCRITO', 'CURSANDO')
        AND bm.bimestre BETWEEN 1 AND 4
      GROUP BY mm.asignacion_docente_id, bm.bimestre
      `,
      {
        replacements: [min, min, docenteId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

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
      { replacements: [gestionAnio], type: sequelize.QueryTypes.SELECT }
    );
    return rows[0] ?? null;
  }

}
