/**
 * estadisticasParaleloHelper — estadísticas de UN paralelo del Libro de
 * registro (bloque "ESTADÍSTICAS" del documento oficial: inscritos/aprobados/
 * reprobados/abandono + porcentajes).
 *
 * Los conteos YA están agregados por folio en la vista 176
 * (`total_estudiantes`/`total_aprobados`/`total_reprobados`/`total_abandonos`/
 * `total_cursando`) — este helper solo SUMA las filas de folio de un mismo
 * paralelo y calcula porcentajes; cero SQL nuevo.
 *
 * `estudiantesPendientes` (materias sin nota_final, CURSANDO) NO se agrega al
 * bloque impreso oficial (`LIBRO_REGISTRO_DOC.estadisticas.filas` en
 * `libros.constants.js`, que espeja el documento físico real) — se expone acá
 * para la ficha del libro en pantalla, donde ayuda a explicar por qué
 * aprobados+reprobados+abandono no suman el total de inscritos mientras el
 * paralelo sigue con materias pendientes de nota (Fase C2, 2026-08-06).
 */

/** Porcentaje redondeado (sin decimales, convención del sistema). 0 si no hay total. */
const porcentaje = (parte, total) => (total > 0 ? Math.round((parte / total) * 100) : 0);

/**
 * Suma los conteos de folio (vista 176) de un mismo `paralelo_gestion_id` y
 * calcula los porcentajes redondeados.
 *
 * @param {Array<Object>} foliosParalelo - Filas de folio (vista 176), ya
 *        filtradas al paralelo/hoja correspondiente.
 * @returns {{
 *   estudiantesInscritos: number,
 *   estudiantesAprobados: number,
 *   estudiantesReprobados: number,
 *   abandono: number,
 *   estudiantesPendientes: number,
 *   porcentajeInscritos: number,
 *   porcentajeAprobados: number,
 *   porcentajeReprobados: number,
 *   porcentajeAbandono: number,
 *   porcentajePendientes: number,
 * }}
 */
export function calcularEstadisticasParalelo(foliosParalelo) {
  const folios = Array.isArray(foliosParalelo) ? foliosParalelo : [];
  const sumarCampo = (campo) =>
    folios.reduce((acumulado, folio) => acumulado + Number(folio?.[campo] ?? 0), 0);

  const estudiantesInscritos = sumarCampo('total_estudiantes');
  const estudiantesAprobados = sumarCampo('total_aprobados');
  const estudiantesReprobados = sumarCampo('total_reprobados');
  const abandono = sumarCampo('total_abandonos');
  const estudiantesPendientes = sumarCampo('total_cursando');

  return {
    estudiantesInscritos,
    estudiantesAprobados,
    estudiantesReprobados,
    abandono,
    estudiantesPendientes,
    porcentajeInscritos: estudiantesInscritos > 0 ? 100 : 0,
    porcentajeAprobados: porcentaje(estudiantesAprobados, estudiantesInscritos),
    porcentajeReprobados: porcentaje(estudiantesReprobados, estudiantesInscritos),
    porcentajeAbandono: porcentaje(abandono, estudiantesInscritos),
    porcentajePendientes: porcentaje(estudiantesPendientes, estudiantesInscritos),
  };
}

export default { calcularEstadisticasParalelo };
