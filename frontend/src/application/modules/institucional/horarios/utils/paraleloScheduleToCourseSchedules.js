/**
 * Adapta la respuesta de GET /paralelos/:id/schedule al shape `courseSchedules`
 * esperado por DocenteHorarioSemanalGrid (bloques con dia, horas, aula, etc.).
 *
 * @param {unknown} apiPayload - `data` del use case o `{ schedule: curso[] }`
 * @param {{ turno?: string|null, paraleloNombre?: string|null }} ctx
 * @returns {Array<{ cursoId: number, cursoCodigo: string, cursoColorHex: string|null, materiaNombre?: string|null, materiaSigla?: string|null, bloques: object[] }>}
 */
export function unwrapParaleloSchedulePayload(apiPayload) {
    if (!apiPayload) return [];
    if (Array.isArray(apiPayload)) return apiPayload;
    if (Array.isArray(apiPayload.schedule)) return apiPayload.schedule;
    return [];
}

/** Metadatos del paralelo cuando el backend devuelve `{ paralelo, schedule }`. */
export function extractParaleloScheduleMeta(apiPayload) {
    if (!apiPayload || Array.isArray(apiPayload)) return null;
    return apiPayload.paralelo ?? null;
}

export function paraleloScheduleToCourseSchedules(apiPayload, ctx = {}) {
    const { turno = null, paraleloNombre = null } = ctx;
    const rows = unwrapParaleloSchedulePayload(apiPayload);

    return rows.map((curso) => ({
        cursoId: curso.cursoId,
        cursoCodigo: curso.materiaSigla || curso.materiaNombre || '—',
        cursoColorHex: curso.color ?? null,
        materiaNombre: curso.materiaNombre ?? null,
        materiaSigla: curso.materiaSigla ?? null,
        horasSemanalesPlan: curso.horasSemanalesPlan ?? null,
        bloques: (curso.horarios || []).map((h) => ({
            orden: h.ordenSecuencia,
            cursoHorarioId: h.id,
            dia: h.horario?.dia ?? null,
            horaInicio: h.horario?.horaInicio,
            horaFin: h.horario?.horaFin,
            turno,
            paralelo: paraleloNombre,
            aula: h.aula ?? null,
        })),
    }));
}
