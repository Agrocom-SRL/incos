/**
 * Columna del tablero de gestión de horarios.
 * Prioridad: sin horarios/plan → sin docentes → sin aulas → completo.
 */

/** @typedef {'sin_docentes'|'sin_aulas'|'sin_horarios'|'completo'} HorariosBoardBucket */

/**
 * @param {Record<string, unknown>} p — fila mapeada del dashboard (useGestionHorariosDashboardState)
 * @returns {HorariosBoardBucket}
 */
export function resolveHorariosBoardBucket(p) {
    const explicit = p?.boardBucket ?? p?.board_bucket ?? p?.tablero_grupo;
    if (explicit != null && explicit !== '') return explicit;

    const tot = Number(p.cursosTotales) || 0;
    const cread = Number(p.cursosCreados) || 0;
    const sinBloques = Number(p.cursosSinBloquesHorario) || 0;
    const bloquesSinAula = Number(p.bloquesSinAula) || 0;
    const sinDoc = Number(p.cursosSinDocente) || 0;
    const solape = Number(p.conflictosSolapeMismoBloque) || 0;
    const confAula = Number(p.conflictosAula) || 0;
    const docChoc = Boolean(p.conflictoDocenteHorario);

    const sinHorarios = (tot > 0 && cread < tot) || sinBloques > 0 || solape > 0;
    if (sinHorarios) return 'sin_horarios';

    const sinDocentes = sinDoc > 0 || docChoc;
    if (sinDocentes) return 'sin_docentes';

    const sinAulas = bloquesSinAula > 0 || confAula > 0;
    if (sinAulas) return 'sin_aulas';

    return 'completo';
}
