/**
 * Columna del tablero de gestión de horarios.
 * Prioridad: sin aulas → sin docentes → sin horarios → completo.
 */

/** @typedef {'sin_aulas'|'sin_docentes'|'sin_horarios'|'completo'} HorariosBoardBucket */

/**
 * @param {Record<string, unknown>} p — fila mapeada del dashboard (useGestionHorariosDashboardState)
 * @returns {HorariosBoardBucket}
 */
export function resolveHorariosBoardBucket(p) {
    const explicit = p?.boardBucket ?? p?.board_bucket ?? p?.tablero_grupo;
    if (explicit != null && explicit !== '') return explicit;

    const tot = Number(p.cursosTotales) || 0;
    const cread = Number(p.cursosCreados) || 0;
    const conHorario = Number(p.cursosAsignados) || 0;
    const coberturaIncompleta = Number(p.ofertasCoberturaIncompleta) || 0;
    const sinBloques =
        Number(p.cursosSinBloquesHorario) || Math.max(0, cread - conHorario, coberturaIncompleta);
    const bloquesSinAula = Number(p.bloquesSinAula) || 0;
    const sinDoc = Number(p.cursosSinDocente) || 0;
    const solape = Number(p.conflictosSolapeMismoBloque) || 0;
    const confAula = Number(p.conflictosAula) || 0;
    const docChoc = Boolean(p.conflictoDocenteHorario);
    const sinAulaParalelo = p.paraleloAulaId == null || p.paraleloAulaId === 0;

    if (sinAulaParalelo || bloquesSinAula > 0) return 'sin_aulas';

    if (sinDoc > 0 || docChoc) return 'sin_docentes';

    if ((tot > 0 && cread < tot) || coberturaIncompleta > 0 || sinBloques > 0 || solape > 0 || confAula > 0) {
        return 'sin_horarios';
    }

    return 'completo';
}
