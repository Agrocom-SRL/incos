/**
 * estadisticasParaleloHelper — estadísticas de UN paralelo del Libro de
 * registro (bloque "ESTADÍSTICAS" del documento oficial: inscritos/aprobados/
 * reprobados/abandono + porcentajes).
 *
 * Los conteos YA están agregados por folio en la vista 176
 * (`total_estudiantes`/`total_aprobados`/`total_reprobados`/`total_abandonos`)
 * — este helper solo SUMA las filas de folio de un mismo paralelo y calcula
 * porcentajes; cero SQL nuevo.
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
 *   porcentajeInscritos: number,
 *   porcentajeAprobados: number,
 *   porcentajeReprobados: number,
 *   porcentajeAbandono: number,
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

  return {
    estudiantesInscritos,
    estudiantesAprobados,
    estudiantesReprobados,
    abandono,
    porcentajeInscritos: estudiantesInscritos > 0 ? 100 : 0,
    porcentajeAprobados: porcentaje(estudiantesAprobados, estudiantesInscritos),
    porcentajeReprobados: porcentaje(estudiantesReprobados, estudiantesInscritos),
    porcentajeAbandono: porcentaje(abandono, estudiantesInscritos),
  };
}

export default { calcularEstadisticasParalelo };
