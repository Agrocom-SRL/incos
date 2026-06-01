/**
 * Planes de horario por paralelo para vista de publicación (una query, sin N+1).
 */
function buildPlanes(rows) {
    const byParalelo = new Map();
    for (const r of rows || []) {
        const pgId = r.paralelo_gestion_id != null ? Number(r.paralelo_gestion_id) : null;
        const pid = Number(r.paralelo_id);
        if (!Number.isFinite(pid)) continue;
        const groupKey =
            Number.isFinite(pgId) && pgId > 0 ? `pg:${pgId}` : `p:${pid}`;
        if (!byParalelo.has(groupKey)) {
            byParalelo.set(groupKey, {
                paralelo: {
                    id: pid,
                    paraleloGestionId: Number.isFinite(pgId) && pgId > 0 ? pgId : null,
                    paraleloGestionEstado: r.paralelo_gestion_estado ?? null,
                    nombre: r.paralelo_nombre ?? null,
                    turno: r.paralelo_turno ?? null,
                    carreraNombre: r.carrera_nombre ?? null,
                    carreraId: r.carrera_id != null ? Number(r.carrera_id) : null,
                    carreraCodigo: r.carrera_codigo ?? null,
                    carreraColorHex: r.carrera_color_hex ?? null,
                    periodoNombre: r.periodo_nombre ?? null,
                },
                courses: new Map(),
            });
        }
        const slot = byParalelo.get(groupKey);
        const cid = Number(r.curso_id);
        if (!Number.isFinite(cid)) continue;
        if (!slot.courses.has(cid)) {
            slot.courses.set(cid, {
                cursoId: cid,
                materiaNombre: r.materia_nombre ?? null,
                materiaSigla: r.materia_sigla ?? null,
                docenteNombre: r.docente_nombre ?? null,
                docente: r.docente_nombre ?? null,
                color: r.curso_color_hex ?? null,
                horarios: [],
            });
        }
        const aula =
            r.aula_codigo && r.aula_nombre
                ? `${r.aula_codigo} — ${r.aula_nombre}`
                : r.aula_codigo || r.aula_nombre || null;
        slot.courses.get(cid).horarios.push({
            id: Number(r.curso_horario_id),
            ordenSecuencia: Number(r.orden_secuencia ?? 0),
            horario: {
                dia: r.dia ?? null,
                horaInicio: r.hora_inicio ?? null,
                horaFin: r.hora_fin ?? null,
            },
            aula,
        });
    }

    const planes = [];
    for (const { paralelo, courses } of byParalelo.values()) {
        const schedule = [...courses.values()].map((c) => ({
            ...c,
            horarios: [...c.horarios].sort((a, b) => a.ordenSecuencia - b.ordenSecuencia),
        }));
        planes.push({ paralelo, schedule });
    }

    planes.sort((a, b) => {
        const ca = String(a.paralelo.carreraNombre || '').localeCompare(String(b.paralelo.carreraNombre || ''));
        if (ca !== 0) return ca;
        const pa = String(a.paralelo.periodoNombre || '').localeCompare(String(b.paralelo.periodoNombre || ''));
        if (pa !== 0) return pa;
        const ta = String(a.paralelo.nombre || '').localeCompare(String(b.paralelo.nombre || ''));
        if (ta !== 0) return ta;
        return String(a.paralelo.turno || '').localeCompare(String(b.paralelo.turno || ''));
    });

    return planes;
}

export class GetHorariosPublicacionPlanesUseCase {
    constructor({ parallelRepository, logger }) {
        this.parallelRepository = parallelRepository;
        this.logger = logger;
    }

    async execute(filters = {}) {
        this.logger.info('[Academico] Horarios publicación — planes', { filters });
        const rows = await this.parallelRepository.obtenerPublicacionBloques(filters);
        return { planes: buildPlanes(rows) };
    }
}
