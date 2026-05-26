import { sequelize } from '../database/sequelize.js';
import { CalificacionContextoRepository } from './CalificacionContextoRepository.js';

/**
 * Consultas del cuaderno bimestral (evaluaciones + notas cargadas).
 */
export class CuadernoRepository {
  constructor() {
    this.contexto = new CalificacionContextoRepository();
  }

  /**
   * @param {number} gestionId
   * @param {number} bimestreNumero 1-4
   * @returns {Promise<number|null>}
   */
  async obtenerPeriodoAcademicoId(gestionId, bimestreNumero) {
    const rows = await sequelize.query(
      `
      SELECT periodo_academico_id AS id
      FROM vista_base_calificacion_periodos_bimestre
      WHERE gestion_id = ?
        AND numero_orden = ?
      LIMIT 1
      `,
      {
        replacements: [gestionId, bimestreNumero],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return rows[0]?.id != null ? Number(rows[0].id) : null;
  }

  /**
   * @param {number} asignacionId
   * @param {number} periodoAcademicoId
   */
  async listarEvaluaciones(asignacionId, periodoAcademicoId) {
    return sequelize.query(
      `
      SELECT
        id,
        tipo_evaluacion_id,
        componente,
        nombre_evaluacion,
        puntos,
        fecha,
        notas_cerradas,
        activo,
        created_at,
        updated_at
      FROM vista_base_cuaderno_evaluacion_columna
      WHERE asignacion_docente_id = ?
        AND periodo_academico_id = ?
      ORDER BY id ASC
      `,
      {
        replacements: [asignacionId, periodoAcademicoId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  /**
   * Notas ya cargadas (carga perezosa) para poblar la grilla.
   */
  async listarNotasCuaderno(asignacionId, bimestreNumero) {
    return sequelize.query(
      `
      SELECT
        estudiante_id,
        evaluacion_id,
        nota
      FROM vista_base_cuaderno_nota_celda
      WHERE asignacion_docente_id = ?
        AND bimestre = ?
        AND nota IS NOT NULL
      `,
      {
        replacements: [asignacionId, bimestreNumero],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  /**
   * @param {number} evaluacionId
   * @param {number} asignacionId
   */
  async obtenerEvaluacionDeAsignacion(evaluacionId, asignacionId) {
    const rows = await sequelize.query(
      `
      SELECT
        e.id,
        e.asignacion_docente_id,
        e.periodo_academico_id,
        e.tipo_evaluacion_id,
        e.componente,
        e.nombre_evaluacion,
        e.puntos,
        e.fecha,
        e.notas_cerradas
      FROM evaluaciones e
      WHERE e.id = ?
        AND e.asignacion_docente_id = ?
        AND e.deleted_at IS NULL
        AND e.activo = TRUE
      LIMIT 1
      `,
      {
        replacements: [evaluacionId, asignacionId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return rows[0] ?? null;
  }

  /**
   * @param {number} asignacionId
   * @param {number} estudianteId
   * @param {number} bimestreNum
   */
  async obtenerBimestreMatriculaId(asignacionId, estudianteId, bimestreNum) {
    const rows = await sequelize.query(
      `
      SELECT bimestre_matricula_id AS id
      FROM vista_base_cuaderno_estudiante_bimestre_matricula
      WHERE asignacion_docente_id = ?
        AND estudiante_id = ?
        AND bimestre = ?
      LIMIT 1
      `,
      {
        replacements: [asignacionId, estudianteId, bimestreNum],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return rows[0]?.id != null ? Number(rows[0].id) : null;
  }

  /**
   * Crea la fila en bimestres_matricula si el estudiante está matriculado pero aún no tiene el bimestre.
   */
  async asegurarBimestreMatriculaId(asignacionId, estudianteId, bimestreNum, usuarioId) {
    const existente = await this.obtenerBimestreMatriculaId(
      asignacionId,
      estudianteId,
      bimestreNum,
    );
    if (existente) return existente;

    const mmRows = await sequelize.query(
      `
      SELECT mm.id AS matricula_materia_id
      FROM matriculas_materia mm
      INNER JOIN inscripciones ins ON ins.id = mm.inscripcion_id
        AND ins.deleted_at IS NULL AND ins.activo = TRUE
      INNER JOIN estudiantes_datos_academicos eda ON eda.id = ins.datos_academicos_id
        AND eda.deleted_at IS NULL AND eda.activo = TRUE
      INNER JOIN estudiantes est ON est.id = eda.estudiante_id
        AND est.deleted_at IS NULL AND est.activo = TRUE
      WHERE mm.asignacion_docente_id = ?
        AND est.id = ?
        AND mm.estado IN ('INSCRITO', 'CURSANDO')
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
      LIMIT 1
      `,
      {
        replacements: [asignacionId, estudianteId],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    const matriculaMateriaId = mmRows[0]?.matricula_materia_id;
    if (!matriculaMateriaId) return null;

    const insert = await sequelize.query(
      `
      INSERT INTO bimestres_matricula (
        matricula_materia_id, bimestre, estado, activo, created_by, updated_by
      )
      VALUES (?, ?, 'EN_CURSO', TRUE, ?, ?)
      `,
      {
        replacements: [matriculaMateriaId, bimestreNum, usuarioId, usuarioId],
        type: sequelize.QueryTypes.INSERT,
      },
    );

    const nuevoId = Number(Array.isArray(insert) ? insert[0] : insert);
    return Number.isFinite(nuevoId) && nuevoId > 0 ? nuevoId : null;
  }

  /**
   * Asegura las 4 filas de bimestre por cada matrícula activa del curso (idempotente).
   */
  async asegurarBimestresMatriculaCurso(asignacionId, bimestreVigenteNum, usuarioId) {
    await sequelize.query(
      `
      INSERT INTO bimestres_matricula (
        matricula_materia_id, bimestre, estado, activo, created_by, updated_by
      )
      SELECT
        mm.id,
        nums.n,
        CASE WHEN nums.n = ? THEN 'EN_CURSO' ELSE 'PENDIENTE' END,
        TRUE,
        ?,
        ?
      FROM matriculas_materia mm
      CROSS JOIN (
        SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      ) nums
      LEFT JOIN bimestres_matricula bm
        ON bm.matricula_materia_id = mm.id
        AND bm.bimestre = nums.n
        AND bm.deleted_at IS NULL
      WHERE mm.asignacion_docente_id = ?
        AND mm.estado IN ('INSCRITO', 'CURSANDO')
        AND mm.deleted_at IS NULL
        AND mm.activo = TRUE
        AND bm.id IS NULL
      `,
      {
        replacements: [bimestreVigenteNum, usuarioId, usuarioId, asignacionId],
        type: sequelize.QueryTypes.INSERT,
      },
    );
  }

  async buscarNotaCelda(evaluacionId, bimestreMatriculaId) {
    const rows = await sequelize.query(
      `
      SELECT id, nota
      FROM evaluaciones_notas
      WHERE evaluacion_id = ?
        AND bimestre_matricula_id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
      LIMIT 1
      `,
      {
        replacements: [evaluacionId, bimestreMatriculaId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return rows[0] ?? null;
  }

  /**
   * @param {{ evaluacionId: number, bimestreMatriculaId: number, nota: number, usuarioId: number }} params
   */
  async upsertNotaCelda({ evaluacionId, bimestreMatriculaId, nota, usuarioId }) {
    const existente = await this.buscarNotaCelda(evaluacionId, bimestreMatriculaId);
    if (existente?.id) {
      await sequelize.query(
        `
        UPDATE evaluaciones_notas
        SET nota = ?, updated_by = ?, updated_at = NOW(), activo = TRUE, deleted_at = NULL, deleted_by = NULL
        WHERE id = ?
        `,
        {
          replacements: [nota, usuarioId, existente.id],
          type: sequelize.QueryTypes.UPDATE,
        },
      );
      const rows = await sequelize.query(
        `SELECT nota FROM evaluaciones_notas WHERE id = ? LIMIT 1`,
        {
          replacements: [existente.id],
          type: sequelize.QueryTypes.SELECT,
        },
      );
      return { id: Number(existente.id), nota: rows[0]?.nota ?? nota };
    }

    const insert = await sequelize.query(
      `
      INSERT INTO evaluaciones_notas (evaluacion_id, bimestre_matricula_id, nota, intento, activo, created_by, updated_by)
      VALUES (?, ?, ?, 1, TRUE, ?, ?)
      `,
      {
        replacements: [evaluacionId, bimestreMatriculaId, nota, usuarioId, usuarioId],
        type: sequelize.QueryTypes.INSERT,
      },
    );
    return { id: Number(insert), nota };
  }

  async eliminarNotaCelda(evaluacionId, bimestreMatriculaId, usuarioId) {
    const existente = await this.buscarNotaCelda(evaluacionId, bimestreMatriculaId);
    if (!existente?.id) return;
    await sequelize.query(
      `
      UPDATE evaluaciones_notas
      SET deleted_at = NOW(), deleted_by = ?, activo = FALSE, updated_by = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
      `,
      {
        replacements: [usuarioId, usuarioId, existente.id],
        type: sequelize.QueryTypes.UPDATE,
      },
    );
  }

  async softEliminarNotasPorEvaluacion(evaluacionId, usuarioId) {
    await sequelize.query(
      `
      UPDATE evaluaciones_notas
      SET deleted_at = NOW(), deleted_by = ?, activo = FALSE, updated_by = ?, updated_at = NOW()
      WHERE evaluacion_id = ?
        AND deleted_at IS NULL
      `,
      {
        replacements: [usuarioId, usuarioId, evaluacionId],
        type: sequelize.QueryTypes.UPDATE,
      },
    );
  }

  /**
   * Filas activas para recalcular componentes del bimestre (todas las evaluaciones del curso).
   */
  async listarFilasCalculoBimestre(asignacionId, bimestreNumero) {
    const rows = await sequelize.query(
      `
      SELECT
        bm.id AS bimestre_matricula_id,
        nc.componente,
        nc.puntos_maximos AS puntos,
        nc.nota
      FROM bimestres_matricula bm
      INNER JOIN matriculas_materia mm
        ON mm.id = bm.matricula_materia_id
        AND mm.deleted_at IS NULL AND mm.activo = TRUE
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
        AND ad.deleted_at IS NULL AND ad.activo = TRUE
      LEFT JOIN vista_base_cuaderno_nota_celda nc
        ON nc.bimestre_matricula_id = bm.id
        AND nc.asignacion_docente_id = ad.id
        AND nc.nota IS NOT NULL
      WHERE mm.asignacion_docente_id = ?
        AND bm.bimestre = ?
        AND bm.deleted_at IS NULL
        AND bm.activo = TRUE
      `,
      {
        replacements: [asignacionId, bimestreNumero],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    return rows.map((r) => ({
      bimestreMatriculaId: Number(r.bimestre_matricula_id),
      componente: r.componente,
      puntos: r.puntos != null ? Number(r.puntos) : null,
      nota: r.nota != null ? Number(r.nota) : null,
    }));
  }

  async listarEstudiantesResumenBimestre(asignacionId, bimestreNumero) {
    return sequelize.query(
      `
      SELECT
        emc.estudiante_id,
        emc.codigo,
        emc.nombre,
        bm.id AS bimestre_matricula_id,
        bm.nota_teorico,
        bm.nota_practico,
        bm.nota_bimestre,
        bm.habilitacion_teorico,
        bm.habilitacion_practico,
        bm.fecha_habilitacion,
        bm.estado AS estado_bimestre
      FROM vista_base_calificacion_estudiante_matricula_curso emc
      LEFT JOIN bimestres_matricula bm
        ON bm.matricula_materia_id = emc.matricula_materia_id
        AND bm.bimestre = ?
        AND bm.deleted_at IS NULL
        AND bm.activo = TRUE
      WHERE emc.asignacion_docente_id = ?
      ORDER BY emc.nombre ASC, emc.estudiante_id ASC
      `,
      {
        replacements: [bimestreNumero, asignacionId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  async listarTodasNotasBimestreCuaderno(asignacionId, bimestreNumero) {
    return sequelize.query(
      `
      SELECT
        estudiante_id,
        evaluacion_id,
        nota
      FROM vista_base_cuaderno_nota_celda
      WHERE asignacion_docente_id = ?
        AND bimestre = ?
      `,
      {
        replacements: [asignacionId, bimestreNumero],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  async listarBimestresMatriculaIdsCurso(asignacionId, bimestreNumero) {
    const rows = await sequelize.query(
      `
      SELECT bm.id
      FROM bimestres_matricula bm
      INNER JOIN matriculas_materia mm ON mm.id = bm.matricula_materia_id
        AND mm.deleted_at IS NULL AND mm.activo = TRUE
      INNER JOIN asignaciones_docentes ad ON ad.id = mm.asignacion_docente_id
        AND ad.deleted_at IS NULL AND ad.activo = TRUE
      WHERE mm.asignacion_docente_id = ?
        AND bm.bimestre = ?
        AND bm.deleted_at IS NULL
        AND bm.activo = TRUE
      `,
      {
        replacements: [asignacionId, bimestreNumero],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return rows.map((r) => Number(r.id));
  }

  async actualizarComponentesBimestreMatricula(bimestreMatriculaId, { teorico, practico, bimestre }, usuarioId) {
    await sequelize.query(
      `
      UPDATE bimestres_matricula
      SET
        nota_teorico = ?,
        nota_practico = ?,
        nota_bimestre = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      {
        replacements: [teorico, practico, bimestre, usuarioId, bimestreMatriculaId],
        type: sequelize.QueryTypes.UPDATE,
      },
    );
  }

  /** @param {number} bimestreMatriculaId */
  async obtenerBimestreMatriculaPorId(bimestreMatriculaId) {
    const rows = await sequelize.query(
      `
      SELECT
        nota_teorico,
        nota_practico,
        nota_bimestre,
        habilitacion_teorico,
        habilitacion_practico,
        fecha_habilitacion
      FROM bimestres_matricula
      WHERE id = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      {
        replacements: [bimestreMatriculaId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return rows[0] ?? null;
  }

  /**
   * Carga administrativa rápida: habilitación por componente + nota_bimestre efectiva.
   */
  async actualizarHabilitacionBimestreMatricula(
    bimestreMatriculaId,
    { habilitacionTeorico, habilitacionPractico, notaBimestre, fechaHabilitacion },
    usuarioId,
  ) {
    await sequelize.query(
      `
      UPDATE bimestres_matricula
      SET
        habilitacion_teorico = ?,
        habilitacion_practico = ?,
        nota_bimestre = ?,
        fecha_habilitacion = COALESCE(?, fecha_habilitacion, CURDATE()),
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      {
        replacements: [
          habilitacionTeorico,
          habilitacionPractico,
          notaBimestre,
          fechaHabilitacion ?? null,
          usuarioId,
          bimestreMatriculaId,
        ],
        type: sequelize.QueryTypes.UPDATE,
      },
    );
  }

  async listarResumenNotasPorMatricula(asignacionId) {
    return sequelize.query(
      `
      SELECT
        matricula_materia_id,
        bimestre,
        nota_bimestre,
        habilitacion_teorico,
        habilitacion_practico
      FROM vista_base_cuaderno_resumen_estudiante_bimestre
      WHERE asignacion_docente_id = ?
      `,
      {
        replacements: [asignacionId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }

  async actualizarNotaFinalMatricula(matriculaMateriaId, notaFinal, usuarioId) {
    await sequelize.query(
      `
      UPDATE matriculas_materia
      SET nota_final = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
      `,
      {
        replacements: [notaFinal, usuarioId, matriculaMateriaId],
        type: sequelize.QueryTypes.UPDATE,
      },
    );
  }
}

export default CuadernoRepository;
