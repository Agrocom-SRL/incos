import { sequelize } from '../database/sequelize.js';
import { ICuadernoRepository } from '../../domain/interfaces/repositories/ICuadernoRepository.js';

/**
 * Lecturas del cuaderno bimestral (evaluaciones + notas cargadas + resúmenes).
 * Repositorio de SOLO LECTURA / coordinación: las escrituras viven en los repos
 * de tabla única (evaluaciones_notas, bimestres_matricula, matriculas_materia),
 * orquestadas por los casos de uso / utils de application.
 */
export class CuadernoRepository extends ICuadernoRepository {
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
      INNER JOIN asignaciones_docentes ad ON ad.oferta_curso_id = mm.oferta_curso_id
        AND ad.deleted_at IS NULL AND ad.activo = TRUE
      LEFT JOIN vista_base_cuaderno_nota_celda nc
        ON nc.bimestre_matricula_id = bm.id
        AND nc.asignacion_docente_id = ad.id
        AND nc.nota IS NOT NULL
      WHERE ad.id = ?
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

  /**
   * Estudiantes matriculados con CI y género para exportación registro pedagógico.
   * @param {number} asignacionId
   */
  async listarEstudiantesExportRegistroPedagogico(asignacionId) {
    return sequelize.query(
      `
      SELECT
        emc.estudiante_id,
        emc.codigo,
        emc.nombre,
        est.ci,
        est.genero,
        TRIM(
          CONCAT_WS(
            ' ',
            est.apellido_paterno,
            est.apellido_materno,
            est.nombres
          )
        ) AS nombre_export
      FROM vista_base_calificacion_estudiante_matricula_curso emc
      INNER JOIN estudiantes est
        ON est.id = emc.estudiante_id
        AND est.deleted_at IS NULL
        AND est.activo = TRUE
      WHERE emc.asignacion_docente_id = ?
      ORDER BY nombre_export ASC, emc.estudiante_id ASC
      `,
      {
        replacements: [asignacionId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
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

  async listarResumenNotasPorMatricula(asignacionId) {
    return sequelize.query(
      `
      SELECT
        matricula_materia_id,
        bimestre,
        nota_teorico,
        nota_practico,
        nota_bimestre
      FROM vista_base_cuaderno_resumen_estudiante_bimestre
      WHERE asignacion_docente_id = ?
      `,
      {
        replacements: [asignacionId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }
}

export default CuadernoRepository;
