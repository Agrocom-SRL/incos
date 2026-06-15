/**
 * Normaliza planes de GET /paralelos/dashboard/horarios-publicacion
 * tras columnas paralelo_gestion en vista 84 + métricas tablero (vista 87).
 */

function mapParaleloDashboard(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const cursosTotales = Number(raw.cursosTotales ?? raw.cursos_totales) || 0;
    const cursosCreados = Number(raw.cursosCreados ?? raw.cursos_creados) || 0;
    const cursosConHorario = Number(raw.cursosConHorario ?? raw.cursos_con_horario ?? raw.cursosAsignados ?? raw.cursos_asignados) || 0;
    const ofertasCoberturaIncompleta =
        Number(raw.ofertasCoberturaIncompleta ?? raw.ofertas_cobertura_incompleta) || 0;
    return {
        cursosTotales,
        cursosCreados,
        cursosAsignados: cursosConHorario,
        cursosConHorario,
        ofertasCoberturaIncompleta,
        cursosSinDocente: Number(raw.cursosSinDocente ?? raw.cursos_sin_docente) || 0,
        cursosSinBloquesHorario:
            raw.cursosSinBloquesHorario != null
                ? Number(raw.cursosSinBloquesHorario) || 0
                : Math.max(0, ofertasCoberturaIncompleta, cursosCreados - cursosConHorario),
        bloquesSinAula: Number(raw.bloquesSinAula ?? raw.bloques_sin_aula) || 0,
        conflictosSolapeMismoBloque:
            Number(raw.conflictosSolapeMismoBloque ?? raw.conflictos_solape_mismo_bloque) || 0,
        conflictosAula: Number(raw.conflictosAula ?? raw.conflictos_aula) || 0,
        conflictoDocenteHorario:
            raw.conflictoDocenteHorario === true || Number(raw.conflicto_docente_horario) === 1,
        paraleloAulaId:
            raw.paraleloAulaId != null
                ? Number(raw.paraleloAulaId)
                : raw.paralelo_aula_id != null
                  ? Number(raw.paralelo_aula_id)
                  : null,
        boardBucket: raw.boardBucket ?? raw.board_bucket ?? raw.tablero_grupo ?? null,
    };
}

function mapScheduleCourse(curso) {
    if (!curso || typeof curso !== 'object') return curso;
    const horas =
        curso.horasSemanalesPlan != null
            ? Number(curso.horasSemanalesPlan)
            : curso.horas_plan != null
              ? Number(curso.horas_plan)
              : null;
    return {
        ...curso,
        horasSemanalesPlan: horas != null && horas > 0 ? horas : null,
    };
}

export function mapHorariosPublicacionPlanesPayload(payload) {
    const planes = Array.isArray(payload?.planes) ? payload.planes : [];
    return planes.map((plan) => {
        const paralelo = plan?.paralelo ?? {};
        const pgId = paralelo.paraleloGestionId ?? paralelo.paralelo_gestion_id ?? null;
        const pgEstado =
            paralelo.paraleloGestionEstado ?? paralelo.paralelo_gestion_estado ?? null;
        const schedule = Array.isArray(plan?.schedule)
            ? plan.schedule.map(mapScheduleCourse)
            : plan?.schedule;
        return {
            ...plan,
            schedule,
            paralelo: {
                ...paralelo,
                paraleloGestionId: pgId != null ? Number(pgId) : null,
                paraleloGestionEstado: pgEstado,
            },
            paraleloDashboard: mapParaleloDashboard(plan?.paraleloDashboard),
        };
    });
}
