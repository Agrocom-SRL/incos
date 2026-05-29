/**
 * Presentación del dashboard GET /gestiones/:id/carga-docentes.
 */
export class GestionCargaDocentesMapper {
  /**
   * @param {Object} params
   * @param {Array<{ docenteId: number, nombre: string, colorHex: string|null, maxSemana: number, cargaSemana: number }>} params.docentes
   * @param {{ cursosTotal: number, cursosConDocente: number }} params.cobertura
   */
  static toPresentation({ docentes = [], cobertura = {} }) {
    const rows = docentes.map((d) => {
      const carga = Number(d.cargaSemana) || 0;
      const max = Number(d.maxSemana) || 20;
      const ratio = max > 0 ? Math.round((carga / max) * 1000) / 1000 : 0;
      return {
        docente_id: d.docenteId,
        nombre: d.nombre ?? '',
        carga_semana: carga,
        max_semana: max,
        ratio,
        color_hex: d.colorHex ?? null,
      };
    });

    const horasTotalSemana = rows.reduce((sum, r) => sum + r.carga_semana, 0);
    const docentesSobrecargados = rows.filter((r) => r.carga_semana > r.max_semana).length;

    const cursosTotal = Number(cobertura.cursosTotal) || 0;
    const cursosConDocente = Number(cobertura.cursosConDocente) || 0;
    const coberturaPct =
      cursosTotal > 0 ? Math.round((cursosConDocente / cursosTotal) * 1000) / 10 : 0;

    return {
      totales: {
        docentes_activos: rows.length,
        horas_total_semana: horasTotalSemana,
        docentes_sobrecargados: docentesSobrecargados,
        cobertura: coberturaPct,
      },
      docentes: rows,
    };
  }
}
