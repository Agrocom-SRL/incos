import { idONull, parseFiltroId } from '../../utils/validacionEntrada.js';
/**
 * Planes de horario por paralelo para vista de publicación (una query, sin N+1).
 */

function mapParaleloDashboardRow(row) {
    if (!row) return null;
    const cursosTotales = Number(row.asignaturas_requeridas) || 0;
    const cursosCreados = Number(row.cursos_creados) || 0;
    const cursosConHorario = Number(row.cursos_con_horario) || 0;
    const ofertasCoberturaIncompleta = Number(row.ofertas_cobertura_incompleta) || 0;
    return {
        cursosTotales,
        cursosCreados,
        cursosAsignados: cursosConHorario,
        cursosConHorario,
        ofertasCoberturaIncompleta,
        cursosSinDocente: Number(row.cursos_sin_docente) || 0,
        cursosSinBloquesHorario: Math.max(0, ofertasCoberturaIncompleta, cursosCreados - cursosConHorario),
        bloquesSinAula: Number(row.bloques_sin_aula) || 0,
        conflictosSolapeMismoBloque: Number(row.conflictos_solape_mismo_bloque) || 0,
        conflictosAula: Number(row.conflictos_aula) || 0,
        conflictoDocenteHorario: Number(row.conflicto_docente_horario) === 1,
        paraleloAulaId: row.paralelo_aula_id != null ? Number(row.paralelo_aula_id) : null,
        boardBucket: row.tablero_grupo ?? null,
    };
}

function buildPlanes(rows) {
    const byParalelo = new Map();
    for (const r of rows || []) {
        const pgId = idONull(r.paralelo_gestion_id);
        const pid = idONull(r.paralelo_id);
        if (pid == null) continue;
        const groupKey =
            pgId ? `pg:${pgId}` : `p:${pid}`;
        if (!byParalelo.has(groupKey)) {
            byParalelo.set(groupKey, {
                paralelo: {
                    id: pid,
                    paraleloGestionId: pgId,
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
        const cid = idONull(r.curso_id);
        if (cid == null) continue;
        if (!slot.courses.has(cid)) {
            slot.courses.set(cid, {
                cursoId: cid,
                materiaNombre: r.materia_nombre ?? null,
                materiaSigla: r.materia_sigla ?? null,
                docenteNombre: r.docente_nombre ?? null,
                docente: r.docente_nombre ?? null,
                color: r.curso_color_hex ?? null,
                horasSemanalesPlan:
                    r.horas_plan != null && Number(r.horas_plan) > 0 ? Number(r.horas_plan) : null,
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
        const filtrosValidos = { ...filters };
        if ('carrera_id' in filtrosValidos) {
            filtrosValidos.carrera_id = parseFiltroId(filtrosValidos.carrera_id, 'carrera_id');
        }
        const rows = await this.parallelRepository.obtenerPublicacionBloques(filtrosValidos);
        const planes = buildPlanes(rows);

        const pgIds = planes
            .map((p) => p.paralelo?.paraleloGestionId)
            .filter((id) => id != null && Number(id) > 0);
        const estadoMap = await this.parallelRepository.obtenerEstadoParaleloGestionPorIds(pgIds);

        for (const plan of planes) {
            const pgId = plan.paralelo?.paraleloGestionId;
            if (pgId == null) continue;
            const estadoRow = estadoMap.get(Number(pgId));
            if (estadoRow) {
                plan.paraleloDashboard = mapParaleloDashboardRow(estadoRow);
            }
        }

        return { planes };
    }
}
