import { sequelize } from '../database/sequelize.js';
import { CalificacionContextoRepository } from './CalificacionContextoRepository.js';

/**
 * Gestión institucional de bimestres (estado, métricas, iniciar/cerrar).
 */
export class GestionBimestresRepository {
  constructor({ calificacionContextoRepository } = {}) {
    this.contexto =
      calificacionContextoRepository ?? new CalificacionContextoRepository();
  }

  /** @param {number} gestionId */
  async gestionAcademicaIniciada(gestionId) {
    const rows = await sequelize.query(
      `
      SELECT COUNT(*) AS total
      FROM matriculas_materia mm
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      WHERE gp.gestion_id = ?
        AND mm.estado IN ('CURSANDO', 'APROBADO', 'REPROBADO')
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
    return Number(rows[0]?.total ?? 0) > 0;
  }

  /** @param {number} gestionId @returns {Promise<Map<number, string>>} */
  async estadosInstitucionalesBimestres(gestionId) {
    const rows = await sequelize.query(
      `
      SELECT
        bm.bimestre,
        CASE
          WHEN COUNT(*) = SUM(CASE WHEN bm.estado = 'CERRADO' THEN 1 ELSE 0 END) THEN 'CERRADO'
          WHEN SUM(CASE WHEN bm.estado = 'EN_CURSO' THEN 1 ELSE 0 END) > 0 THEN 'EN_CURSO'
          ELSE 'PENDIENTE'
        END AS estado_institucional
      FROM bimestres_matricula bm
      INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      WHERE gp.gestion_id = ?
        AND mm.estado IN ('INSCRITO', 'CURSANDO')
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
        AND bm.deleted_at IS NULL
        AND bm.activo = TRUE
      GROUP BY bm.bimestre
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
    const map = new Map();
    for (const row of rows) {
      map.set(Number(row.bimestre), row.estado_institucional);
    }
    return map;
  }

  /** @param {number} gestionId */
  async obtenerMetricasGestionBimestres(gestionId) {
    const [cursosRows, metricasRows] = await Promise.all([
      sequelize.query(
        `
        SELECT COUNT(DISTINCT fila.asignacion_docente_id) AS total
        FROM vista_base_calificacion_coordinacion_fila fila
        WHERE fila.gestion_id = ?
        `,
        { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
      ),
      sequelize.query(
        `
        SELECT
          (
            SELECT COUNT(DISTINCT v.docente_id)
            FROM vista_calificacion_coordinacion_docentes v
            WHERE v.gestion_id = ?
          ) AS docentes_activos,
          (
            SELECT COUNT(*)
            FROM bimestres_matricula bm
            INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
            INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
            INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
            WHERE gp.gestion_id = ?
              AND mm.estado = 'CURSANDO'
              AND bm.estado = 'EN_CURSO'
              AND bm.nota_bimestre IS NULL
              AND bm.nota_habilitacion IS NULL
              AND bm.deleted_at IS NULL
              AND bm.activo = TRUE
          ) AS notas_faltantes
        `,
        { replacements: [gestionId, gestionId], type: sequelize.QueryTypes.SELECT },
      ),
    ]);

    const cursosTotal = Number(cursosRows[0]?.total ?? 0);
    const docentesActivos = Number(metricasRows[0]?.docentes_activos ?? 0);
    const notasFaltantes = Number(metricasRows[0]?.notas_faltantes ?? 0);

    return {
      cursosTotal,
      cursosCompletos: Math.max(
        0,
        cursosTotal - Math.min(cursosTotal, Math.ceil(notasFaltantes / 4)),
      ),
      planesSinDefinir: 0,
      notasFaltantes,
      docentesActivos,
    };
  }

  /** @param {number} userId */
  async iniciarGestionAcademica(userId) {
    const ctx = await this.contexto.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      throw new Error('No hay gestión académica vigente');
    }

    const gestionId = Number(ctx.gestion_id);
    const yaIniciada = await this.gestionAcademicaIniciada(gestionId);
    if (yaIniciada) {
      const err = new Error('La gestión académica ya fue iniciada');
      err.code = 'GESTION_YA_INICIADA';
      throw err;
    }

    const [, meta] = await sequelize.query(
      `
      UPDATE matriculas_materia mm
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      SET mm.estado = 'CURSANDO',
          mm.updated_by = ?,
          mm.updated_at = NOW()
      WHERE gp.gestion_id = ?
        AND mm.estado = 'INSCRITO'
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
      `,
      { replacements: [userId, gestionId] },
    );

    await sequelize.query(
      `
      INSERT INTO bimestres_matricula (
        matricula_materia_id, bimestre, estado, created_by, updated_by, activo
      )
      SELECT
        mm.id,
        nums.n,
        CASE WHEN nums.n = 1 THEN 'EN_CURSO' ELSE 'PENDIENTE' END,
        ?,
        ?,
        TRUE
      FROM matriculas_materia mm
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      CROSS JOIN (
        SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      ) nums
      LEFT JOIN bimestres_matricula bm
        ON bm.matricula_materia_id = mm.id
        AND bm.bimestre = nums.n
        AND bm.deleted_at IS NULL
      WHERE gp.gestion_id = ?
        AND mm.estado = 'CURSANDO'
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
        AND bm.id IS NULL
      `,
      { replacements: [userId, userId, gestionId] },
    );

    return {
      matriculasInscritoACursando: meta?.affectedRows ?? 0,
    };
  }

  /** @param {number} numeroBimestre @param {number} gestionId */
  async validarCierreBimestre(numeroBimestre, gestionId) {
    const n = Number(numeroBimestre);
    const estados = await this.estadosInstitucionalesBimestres(gestionId);
    const estadoActual = estados.get(n);

    const bloqueos = [];
    const advertencias = [];

    if (estadoActual !== 'EN_CURSO') {
      bloqueos.push(
        estadoActual === 'CERRADO'
          ? `El bimestre ${n} ya está cerrado.`
          : `El bimestre ${n} no está en curso. Iniciá la gestión o cerrá el bimestre anterior.`,
      );
    }

    const pendientes = await sequelize.query(
      `
      SELECT COUNT(*) AS total
      FROM bimestres_matricula bm
      INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      WHERE gp.gestion_id = ?
        AND bm.bimestre = ?
        AND mm.estado = 'CURSANDO'
        AND bm.estado = 'EN_CURSO'
        AND bm.nota_bimestre IS NULL
        AND bm.nota_habilitacion IS NULL
        AND bm.deleted_at IS NULL
      `,
      { replacements: [gestionId, n], type: sequelize.QueryTypes.SELECT },
    );

    const cursosRows = await sequelize.query(
      `
      SELECT
        ad.id AS asignacion_id,
        m.nombre AS materia,
        CONCAT_WS(' ', d.nombres, d.apellido_paterno, d.apellido_materno) AS docente_nombre,
        p.nombre AS paralelo,
        COUNT(DISTINCT bm.id) AS faltantes
      FROM bimestres_matricula bm
      INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      INNER JOIN cursos c ON c.id = ad.curso_id
      INNER JOIN materias m ON m.id = c.materia_id
      LEFT JOIN paralelos p ON p.id = c.paralelo_id
      LEFT JOIN docentes d ON d.id = ad.docente_id
      WHERE gp.gestion_id = ?
        AND bm.bimestre = ?
        AND mm.estado = 'CURSANDO'
        AND bm.estado = 'EN_CURSO'
        AND bm.nota_bimestre IS NULL
        AND bm.nota_habilitacion IS NULL
        AND bm.deleted_at IS NULL
      GROUP BY ad.id, m.nombre, d.nombres, d.apellido_paterno, p.nombre
      HAVING faltantes > 0
      ORDER BY faltantes DESC, materia ASC
      LIMIT 50
      `,
      { replacements: [gestionId, n], type: sequelize.QueryTypes.SELECT },
    );

    const cursosConNotasFaltantes = cursosRows.map((r) => ({
      asignacionId: Number(r.asignacion_id),
      materia: r.materia,
      docente: r.docente_nombre,
      paralelo: r.paralelo,
      cantidadFaltantes: Number(r.faltantes),
    }));

    if (cursosConNotasFaltantes.length > 0) {
      bloqueos.push(
        `${cursosConNotasFaltantes.length} curso(s) con notas de bimestre sin cerrar impiden el cierre.`,
      );
    }

    return {
      puedeCerrar: bloqueos.length === 0,
      bloqueos,
      advertencias: [],
      cursosConNotasFaltantes,
    };
  }

  /** @param {number} numeroBimestre @param {number} userId */
  async cerrarBimestreGestion(numeroBimestre, userId) {
    const ctx = await this.contexto.obtenerContextoVigente();
    const gestionId = Number(ctx?.gestion_id);
    const n = Number(numeroBimestre);

    const validacion = await this.validarCierreBimestre(n, gestionId);
    if (!validacion.puedeCerrar) {
      const err = new Error('No se puede cerrar el bimestre');
      err.code = 'CIERRE_BLOQUEADO';
      err.validacion = validacion;
      throw err;
    }

    // TODO: cierre masivo con cálculo de nota_teorico/practico/bimestre desde evaluaciones (sprint siguiente)
    return {
      preparacion: true,
      mensaje: 'Funcionalidad en preparación',
      bimestre: n,
      bimestreSiguiente: n < 4 ? n + 1 : null,
    };
  }

  async _metricasPorBimestre(gestionId) {
    const rows = await sequelize.query(
      `
      SELECT
        bm.bimestre,
        COUNT(DISTINCT ad.id) AS cursos_total,
        COUNT(DISTINCT CASE
          WHEN ev.cantidad_evaluaciones > 0 THEN ad.id
        END) AS cursos_plan_completo,
        COUNT(DISTINCT CASE
          WHEN bm.nota_bimestre IS NULL AND bm.nota_habilitacion IS NULL AND bm.estado = 'EN_CURSO'
          THEN ad.id
        END) AS cursos_notas_faltantes
      FROM bimestres_matricula bm
      INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
      INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
      LEFT JOIN vista_base_calificacion_evaluaciones_curso_bimestre ev
        ON ev.asignacion_docente_id = ad.id
        AND ev.gestion_id = gp.gestion_id
        AND ev.bimestre = bm.bimestre
      WHERE gp.gestion_id = ?
        AND mm.estado IN ('INSCRITO', 'CURSANDO')
        AND mm.deleted_at IS NULL
        AND bm.deleted_at IS NULL
      GROUP BY bm.bimestre
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
    const map = new Map();
    for (const r of rows) {
      map.set(Number(r.bimestre), {
        cursosTotal: Number(r.cursos_total ?? 0),
        cursosConPlanCompleto: Number(r.cursos_plan_completo ?? 0),
        cursosConNotasFaltantes: Number(r.cursos_notas_faltantes ?? 0),
      });
    }
    return map;
  }

  async _metricasGlobales(gestionId) {
    const [row] = await sequelize.query(
      `
      SELECT
        COUNT(DISTINCT fila.asignacion_docente_id) AS total_cursos,
        COUNT(DISTINCT fila.docente_id) AS total_docentes,
        COUNT(DISTINCT fila.estudiante_id) AS total_estudiantes
      FROM vista_base_calificacion_coordinacion_fila fila
      WHERE fila.gestion_id = ?
      `,
      { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
    );
    return {
      totalCursos: Number(row?.total_cursos ?? 0),
      totalDocentes: Number(row?.total_docentes ?? 0),
      totalEstudiantes: Number(row?.total_estudiantes ?? 0),
    };
  }

  _mapEstadoUi(numero, inst, calEstado, bimestreVigente, gestionIniciada) {
    if (inst === 'CERRADO' || calEstado === 'cerrado') return 'cerrado';
    if (numero === bimestreVigente && inst === 'EN_CURSO') return 'vigente';
    if (!gestionIniciada && numero === 1) return 'futuro';
    if (numero > 1) {
      const prevCerrado = inst === 'PENDIENTE';
      if (prevCerrado && calEstado === 'futuro') return 'futuro';
    }
    if (calEstado === 'futuro') return 'futuro';
    return 'futuro';
  }

  /** Payload para GET /calificaciones/gestion-bimestres */
  async obtenerGestionBimestres() {
    const ctx = await this.contexto.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      return null;
    }

    const gestionId = Number(ctx.gestion_id);
    const [periodos, gestionIniciada, estadosMap, metricasGlobales, metricasBim] =
      await Promise.all([
        this.contexto.obtenerPeriodosBimestresGestion(gestionId),
        this.gestionAcademicaIniciada(gestionId),
        this.estadosInstitucionalesBimestres(gestionId),
        this._metricasGlobales(gestionId),
        this._metricasPorBimestre(gestionId),
      ]);

    const bimestreVigente = ctx.bimestre_vigente != null ? Number(ctx.bimestre_vigente) : null;

    const bimestres = (periodos ?? []).map((pa) => {
      const numero = Number(pa.numero_orden);
      const inst = estadosMap.get(numero);
      const calEstado = pa.estado_calendario;
      const estado = this._mapEstadoUi(
        numero,
        inst,
        calEstado,
        bimestreVigente,
        gestionIniciada,
      );
      const metricas = metricasBim.get(numero) ?? {
        cursosTotal: 0,
        cursosConPlanCompleto: 0,
        cursosConNotasFaltantes: 0,
      };

      return {
        numero,
        codigo: `B${numero}`,
        nombre: pa.nombre,
        fechaInicio: pa.fecha_inicio,
        fechaFin: pa.fecha_fin,
        estado,
        metricas,
        matriculasTransicionadas:
          numero === 1 && gestionIniciada ? undefined : numero === 1 ? null : undefined,
      };
    });

    if (gestionIniciada && bimestres[0]) {
      const [countRow] = await sequelize.query(
        `
        SELECT COUNT(*) AS total
        FROM matriculas_materia mm
        INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
        INNER JOIN gestiones_planes gp ON gp.id = ad.gestion_plan_id
        WHERE gp.gestion_id = ?
          AND mm.estado = 'CURSANDO'
        `,
        { replacements: [gestionId], type: sequelize.QueryTypes.SELECT },
      );
      bimestres[0].matriculasTransicionadas = Number(countRow?.total ?? 0);
    }

    return {
      gestion: {
        id: gestionId,
        codigo: ctx.gestion_codigo ?? String(gestionId),
        nombre: ctx.gestion_nombre,
        anio: ctx.gestion_anio,
        vigente: Boolean(ctx.gestion_vigente),
      },
      gestionIniciada,
      bimestreVigente,
      metricasGlobales,
      bimestres,
    };
  }
}
