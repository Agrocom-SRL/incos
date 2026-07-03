import { sequelize } from '../../database/sequelize.js';
import { IHistorialAcademicoRepository } from '../../../domain/interfaces/repositories/IHistorialAcademicoRepository.js';

/**
 * Lectura del historial académico (kardex / transcript FORM-SIE-ITT-04) de un
 * estudiante desde la vista final 141 (vista_historial_academico_estudiante_fila),
 * que une las bases 138 (nota efectiva CURSADO), 140 (arrastre/convalidación
 * PREVIO) y 139 (detalle de asignatura del plan). Repositorio de SOLO LECTURA
 * (arquetipo views/): no CRUD, devuelve filas planas.
 *
 * Formato LARGO: una fila por (estudiante × asignatura × gestión), a través de
 * todas las gestiones + filas de arrastre/convalidación (origen = PREVIO). El
 * ordenamiento, la numeración y el resumen los hace el use case.
 */
export class HistorialAcademicoRepository extends IHistorialAcademicoRepository {
  /**
   * @param {number} estudianteId
   * @returns {Promise<Array<Object>>}
   */
  async listarFilasHistorialPorEstudiante(estudianteId) {
    return sequelize.query(
      `
      SELECT *
      FROM vista_historial_academico_estudiante_fila
      WHERE estudiante_id = ?
      ORDER BY gestion_anio ASC, periodo_numero ASC, asignatura_orden ASC
      `,
      { replacements: [estudianteId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /**
   * Cabecera del estudiante para el transcript. Reutiliza la vista de datos
   * académicos (carrera + gestión de ingreso + promedio) y la enriquece con los
   * datos personales de `estudiantes` y el plan de estudio VIGENTE de la carrera
   * (carga horaria total y duración en años).
   * @param {number} estudianteId
   * @returns {Promise<Object|null>}
   */
  async obtenerCabeceraEstudiante(estudianteId) {
    const rows = await sequelize.query(
      `
      SELECT
        e.id                          AS estudiante_id,
        e.codigo_estudiante           AS matricula,
        e.ci                          AS ci,
        e.expedicion                  AS expedicion,
        e.apellido_paterno            AS apellido_paterno,
        e.apellido_materno            AS apellido_materno,
        e.nombres                     AS nombres,
        e.fecha_nacimiento            AS fecha_nacimiento,
        vda.carrera_id                AS carrera_id,
        vda.carrera_nombre            AS carrera_nombre,
        vda.carrera_codigo            AS carrera_codigo,
        vda.carrera_area_formacion    AS carrera_area_formacion,
        vda.carrera_titulo_otorgado   AS titulo_otorgado,
        vda.gestion_ingreso_anio      AS gestion_ingreso_anio,
        vda.promedio_anual            AS promedio_anual,
        pe.carga_horaria_total        AS carga_horaria_total_plan,
        pe.duracion_anios             AS duracion_anios
      FROM estudiantes e
      LEFT JOIN vista_estudiante_datos_academicos vda
        ON vda.estudiante_id = e.id
      LEFT JOIN planes_estudios pe
        ON pe.carrera_id = vda.carrera_id
        AND pe.vigente = 1
        AND pe.deleted_at IS NULL
      WHERE e.id = ?
        AND e.deleted_at IS NULL
      LIMIT 1
      `,
      { replacements: [estudianteId], type: sequelize.QueryTypes.SELECT },
    );
    return rows?.[0] ?? null;
  }
}
