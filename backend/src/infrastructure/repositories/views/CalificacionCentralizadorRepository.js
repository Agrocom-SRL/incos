import { sequelize } from '../../database/sequelize.js';
import { ICalificacionCentralizadorRepository } from '../../../domain/interfaces/repositories/ICalificacionCentralizadorRepository.js';

/**
 * Lectura del centralizador de calificaciones por paralelo (vista base 135).
 * Repositorio de SOLO LECTURA sobre vistas (arquetipo views/).
 *
 * Formato LARGO: una fila por (estudiante × oferta_curso) del paralelo. El
 * pivote a matriz (estudiantes × asignaturas) se hace en el use case.
 */
export class CalificacionCentralizadorRepository extends ICalificacionCentralizadorRepository {
  /**
   * @param {number} paraleloGestionId
   * @returns {Promise<Array<Object>>}
   */
  async listarFilasCentralizadorPorParaleloGestion(paraleloGestionId) {
    return sequelize.query(
      `
      SELECT *
      FROM vista_base_calificacion_centralizador_paralelo_fila
      WHERE paralelo_gestion_id = ?
      ORDER BY nombre_completo ASC, asignatura_orden ASC
      `,
      { replacements: [paraleloGestionId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /**
   * Filas del boletín de UN estudiante (gestión vigente). Reutiliza la misma vista
   * 135, filtrando por estudiante; el grano y columnas son idénticos al centralizador.
   * @param {number} estudianteId
   * @returns {Promise<Array<Object>>}
   */
  async listarFilasCentralizadorPorEstudiante(estudianteId) {
    return sequelize.query(
      `
      SELECT *
      FROM vista_base_calificacion_centralizador_paralelo_fila
      WHERE estudiante_id = ?
      ORDER BY asignatura_orden ASC
      `,
      { replacements: [estudianteId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /**
   * Desglose TEÓRICO/PRÁCTICO de un bimestre para las asignaturas de un
   * estudiante (boletín bimestral). Reutiliza las vistas existentes: 135 aporta
   * el universo estudiante × oferta_curso del paralelo (con matricula_materia_id)
   * y 119 el detalle del bimestre (nota_teorico/practico consolidadas, sumas del
   * cuaderno si sigue abierto, nota_efectiva y estado_bimestre). LEFT JOIN para
   * no perder asignaturas sin registro en ese bimestre (quedan en NULL → '—').
   * @param {number} paraleloGestionId
   * @param {number} estudianteId
   * @param {number} bimestre - 1..4
   * @returns {Promise<Array<Object>>}
   */
  async listarDesgloseBimestrePorEstudiante(paraleloGestionId, estudianteId, bimestre) {
    return sequelize.query(
      `
      SELECT
        f.oferta_curso_id,
        f.matricula_materia_id,
        r.nota_teorico,
        r.nota_practico,
        r.nota_bimestre,
        r.cuaderno_teorico,
        r.cuaderno_practico,
        r.estado_bimestre,
        r.tiene_registro,
        r.nota_efectiva
      FROM vista_base_calificacion_centralizador_paralelo_fila f
      LEFT JOIN vista_base_calificacion_resumen_curso_bimestre_fila r
        ON r.matricula_materia_id = f.matricula_materia_id
        AND r.bimestre = ?
      WHERE f.paralelo_gestion_id = ?
        AND f.estudiante_id = ?
      ORDER BY f.asignatura_orden ASC
      `,
      {
        replacements: [bimestre, paraleloGestionId, estudianteId],
        type: sequelize.QueryTypes.SELECT,
      },
    );
  }
}
