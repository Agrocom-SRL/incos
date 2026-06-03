/**
 * Agrupa paralelos del dashboard de horarios (fallback si la vista no expone tablero_grupo).
 * Prioridad tablero: sin_aulas → sin_docentes → sin_horarios → completo.
 *
 * @param {Record<string, unknown>} row — fila de vista_horarios_paralelo_estado (snake_case desde SQL)
 * @returns {'sin_aulas'|'sin_docentes'|'sin_horarios'|'completo'}
 */
export function computeHorariosParaleloBoardBucket(row) {
  if (row?.tablero_grupo != null && row.tablero_grupo !== '') {
    return row.tablero_grupo;
  }

  const tot = Number(row.asignaturas_requeridas) || 0;
  const cread = Number(row.cursos_creados) || 0;
  const conHorario = Number(row.cursos_con_horario) || 0;
  const coberturaIncompleta = Number(row.ofertas_cobertura_incompleta) || 0;
  const sinBloques = Math.max(0, cread - conHorario);
  const bloquesSinAula = Number(row.bloques_sin_aula) || 0;
  const sinDoc = Number(row.cursos_sin_docente) || 0;
  const solape = Number(row.conflictos_solape_mismo_bloque) || 0;
  const confAula = Number(row.conflictos_aula) || 0;
  const docChoc = Number(row.conflicto_docente_horario) === 1;
  const sinAulaParalelo = row.paralelo_aula_id == null;

  if (sinAulaParalelo || bloquesSinAula > 0 || confAula > 0) return 'sin_aulas';

  if (sinDoc > 0 || docChoc) return 'sin_docentes';

  if ((tot > 0 && cread < tot) || coberturaIncompleta > 0 || sinBloques > 0 || solape > 0) {
    return 'sin_horarios';
  }

  return 'completo';
}

/**
 * KPIs globales (sin filtro de carrera/periodo/turno; el cliente puede recontar si filtra en UI).
 *
 * @param {Array<Record<string, unknown>>} rows — filas con board_bucket ya calculado
 */
export function buildHorariosParaleloDashboardKpis(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const count = (k) => list.filter((r) => r.board_bucket === k).length;
  return {
    total: list.length,
    sin_aulas: count('sin_aulas'),
    sin_docentes: count('sin_docentes'),
    sin_horarios: count('sin_horarios'),
    completos: count('completo'),
  };
}
