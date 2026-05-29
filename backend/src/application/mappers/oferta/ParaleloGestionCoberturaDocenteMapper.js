/**
 * Presentación de cobertura docente por paralelo_gestion.
 */
export class ParaleloGestionCoberturaDocenteMapper {
  /**
   * @param {Object} params
   * @param {number} params.paraleloGestionId
   * @param {number} params.cursosTotal
   * @param {number} params.cursosConDocente
   * @param {Array<{ ofertaCursoId: number, asignatura: string }>} params.faltantes
   */
  static toPresentation({ paraleloGestionId, cursosTotal, cursosConDocente, faltantes = [] }) {
    const total = Number(cursosTotal) || 0;
    const conDocente = Number(cursosConDocente) || 0;
    const sinDocente = Math.max(0, total - conDocente);
    const coberturaPct = total > 0 ? Math.round((conDocente / total) * 1000) / 10 : 0;

    return {
      paralelo_gestion_id: paraleloGestionId,
      cursos_total: total,
      cursos_con_docente: conDocente,
      cursos_sin_docente: sinDocente,
      faltantes: faltantes.map((row) => ({
        oferta_curso_id: row.ofertaCursoId,
        asignatura: row.asignatura ?? '',
      })),
      cobertura_pct: coberturaPct,
    };
  }
}
