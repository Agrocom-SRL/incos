import {
    buildOccupiedSlotKeysFromSchedules,
    slotKey,
} from '@application-institucional/horarios/utils/buildHorarioSlotIndex';
import {
    appendBlockToCourse,
    blockDurationMinutes,
    minutesToHoraStr,
    removeBlockFromSchedules,
} from '@application-institucional/horarios/utils/planSemanalBlockOps';
import {
    getSabadoArmadoGridRangeMinutes,
    getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import { resolveHorasPlanSemanalCurso } from '@application-institucional/horarios/utils/resolveHorasPlanSemanalCurso';

const DIAS_ORDEN = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const SLOT_STEP_MINUTES = 45;

/**
 * Bloques de 45 min requeridos según el plan.
 * En INCOS, `horas_semanales` / `carga_horaria` = cantidad de bloques semanales
 * (1 «hora» del plan ministerial = 1 bloque), no horas reloj.
 * Alineado con vista 123 y cobertura del API (bloques_asignados >= horas_requeridas).
 */
export function bloquesRequeridosPorCarga(horasPlan) {
    const h = Number(horasPlan);
    if (!Number.isFinite(h) || h <= 0) return 0;
    return Math.round(h);
}

/** Minutos ya cubiertos en la grilla para un curso. */
export function minutosGrillaCurso(course) {
    let mins = 0;
    for (const b of course?.bloques || []) {
        mins += blockDurationMinutes(b.horaInicio, b.horaFin);
    }
    return mins;
}

function slotStartsForDay(dia, gridRange, sabadoRange) {
    if (dia === 'SABADO') {
        return sabadoRange.fixedSlotStartsMinutes ?? [];
    }
    const starts = [];
    for (let m = gridRange.start; m < gridRange.end; m += SLOT_STEP_MINUTES) {
        starts.push(m);
    }
    return starts;
}

function collectFreeSlots(schedules, gridRange, sabadoRange) {
    const occupied = buildOccupiedSlotKeysFromSchedules(schedules);
    const free = [];
    for (const dia of DIAS_ORDEN) {
        for (const startM of slotStartsForDay(dia, gridRange, sabadoRange)) {
            const horaInicio = minutesToHoraStr(startM);
            const horaFin = minutesToHoraStr(startM + SLOT_STEP_MINUTES);
            const key = slotKey(dia, horaInicio, horaFin);
            if (key && !occupied.has(key)) {
                free.push({ dia, startM, horaInicio, horaFin, key });
            }
        }
    }
    return free;
}

function diasConActividadParalelo(schedules) {
    const set = new Set();
    for (const course of schedules || []) {
        for (const b of course.bloques || []) {
            const d = b.dia ? String(b.dia).toUpperCase() : '';
            if (d) set.add(d);
        }
    }
    return set;
}

/**
 * Prioridad: días donde ya tiene bloques la materia → huecos en días con actividad del paralelo
 * → días libres L–V → sábado.
 */
function ordenarFranjasParaCurso(freeSlots, course, diasActivosParalelo) {
    const diasCurso = new Set(
        (course.bloques || []).map((b) => String(b.dia || '').toUpperCase()).filter(Boolean),
    );

    const bucket = (slot) => {
        const d = slot.dia;
        if (diasCurso.has(d)) return 0;
        if (d !== 'SABADO' && diasActivosParalelo.has(d)) return 1;
        if (d === 'SABADO') return 3;
        return 2;
    };

    const dayIndex = (d) => {
        const i = DIAS_ORDEN.indexOf(d);
        return i >= 0 ? i : 99;
    };

    return [...freeSlots].sort(
        (a, b) => bucket(a) - bucket(b) || dayIndex(a.dia) - dayIndex(b.dia) || a.startM - b.startM,
    );
}

function resolveHorasPlanCurso(course, horasPlanOverride) {
    if (horasPlanOverride != null && Number(horasPlanOverride) > 0) {
        return Number(horasPlanOverride);
    }
    const h = resolveHorasPlanSemanalCurso(course);
    return h != null && h > 0 ? h : 0;
}

/**
 * Genera bloques locales (draft) para un curso hasta cubrir su carga horaria.
 * @param {object} params
 * @param {object[]} params.schedules
 * @param {number|string} params.cursoId
 * @param {string|null} [params.turnoLabel]
 * @param {Map<string, number>} [params.horarioSlotIndex]
 * @param {{ aulaId?: number|null, aulaNombre?: string|null, aulaCodigo?: string|null, paraleloNombre?: string|null }} [params.aulaMeta]
 * @param {number|null} [params.horasPlanOverride]
 */
export function generarBloquesAutomaticosCurso({
    schedules,
    cursoId,
    turnoLabel = null,
    horarioSlotIndex = null,
    aulaMeta = {},
    horasPlanOverride = null,
}) {
    const course = (schedules || []).find((c) => Number(c.cursoId) === Number(cursoId));
    if (!course) {
        return { schedules, placed: 0, faltante: 0, message: 'Materia no encontrada en el paralelo.' };
    }
    if (!course.docente || !course.asignacionDocenteId) {
        return {
            schedules,
            placed: 0,
            faltante: 0,
            message: 'Asigne un docente en Oferta académica antes de generar bloques.',
        };
    }

    const horasPlan = resolveHorasPlanCurso(course, horasPlanOverride);
    if (horasPlan <= 0) {
        return {
            schedules,
            placed: 0,
            faltante: 0,
            message: 'Esta materia no tiene carga horaria definida en el plan.',
        };
    }

    const targetBlocks = bloquesRequeridosPorCarga(horasPlan);
    const bloquesActuales = course.bloques?.length ?? 0;
    let faltanBloques = Math.max(0, targetBlocks - bloquesActuales);
    if (faltanBloques <= 0) {
        return {
            schedules,
            placed: 0,
            faltante: 0,
            message: 'La carga horaria de esta materia ya está cubierta en la grilla.',
        };
    }

    const gridRange = getTurnoGridRangeMinutes(turnoLabel);
    const sabadoRange = getSabadoArmadoGridRangeMinutes();
    let nextSchedules = schedules;
    let placed = 0;
    const aulaId = aulaMeta.aulaId != null ? Number(aulaMeta.aulaId) : null;
    const aulaLabel =
        aulaMeta.aulaNombre || aulaMeta.aulaCodigo
            ? [aulaMeta.aulaCodigo, aulaMeta.aulaNombre].filter(Boolean).join(' · ')
            : null;

    while (faltanBloques > 0) {
        const currentCourse = nextSchedules.find((c) => Number(c.cursoId) === Number(cursoId));
        const free = collectFreeSlots(nextSchedules, gridRange, sabadoRange);
        const ordered = ordenarFranjasParaCurso(
            free,
            currentCourse,
            diasConActividadParalelo(nextSchedules),
        );
        const slot = ordered[0];
        if (!slot) break;

        const horarioId = horarioSlotIndex?.get(slot.key) ?? null;
        const tempId = `temp-auto-${cursoId}-${Date.now()}-${placed}`;
        const bloque = {
            cursoHorarioId: tempId,
            dia: slot.dia,
            horaInicio: slot.horaInicio,
            horaFin: slot.horaFin,
            turno: turnoLabel || null,
            paralelo: aulaMeta.paraleloNombre ?? null,
            aula: aulaLabel,
            aulaId: Number.isFinite(aulaId) && aulaId > 0 ? aulaId : null,
            horarioId: horarioId ?? undefined,
            asignacionDocenteId: course.asignacionDocenteId ?? null,
        };

        nextSchedules = appendBlockToCourse(nextSchedules, cursoId, bloque);
        placed += 1;
        faltanBloques -= 1;
    }

    let message = null;
    if (placed === 0) {
        message = 'No hay franjas libres en el turno (incluido sábado) para añadir más bloques.';
    } else if (faltanBloques > 0) {
        message = `Se generaron ${placed} bloque(s); faltan ${faltanBloques} franja(s) libre(s) para cubrir toda la carga.`;
    }

    return {
        schedules: nextSchedules,
        placed,
        faltante: faltanBloques,
        message,
    };
}

/**
 * Alinea bloques del curso con la carga del plan: elimina excedentes y genera faltantes.
 * @param {object} params — mismos que generarBloquesAutomaticosCurso
 * @returns {{ schedules: object[], removed: number, placed: number, faltante: number, message: string|null }}
 */
export function reajustarCoberturaCurso(params) {
    const {
        schedules,
        cursoId,
        turnoLabel = null,
        horarioSlotIndex = null,
        aulaMeta = {},
        horasPlanOverride = null,
    } = params;

    const course = (schedules || []).find((c) => Number(c.cursoId) === Number(cursoId));
    if (!course) {
        return {
            schedules,
            removed: 0,
            placed: 0,
            faltante: 0,
            message: 'Materia no encontrada en el paralelo.',
        };
    }
    if (!course.docente || !course.asignacionDocenteId) {
        return {
            schedules,
            removed: 0,
            placed: 0,
            faltante: 0,
            message: 'Asigne un docente en Oferta académica antes de reajustar bloques.',
        };
    }

    const horasPlan = resolveHorasPlanCurso(course, horasPlanOverride);
    const targetBlocks = bloquesRequeridosPorCarga(horasPlan);
    if (targetBlocks <= 0) {
        return {
            schedules,
            removed: 0,
            placed: 0,
            faltante: 0,
            message: 'Esta materia no tiene carga horaria definida en el plan.',
        };
    }

    let nextSchedules = schedules;
    const bloquesActuales = course.bloques?.length ?? 0;
    let removed = 0;

    if (bloquesActuales > targetBlocks) {
        const exceso = bloquesActuales - targetBlocks;
        const sorted = [...(course.bloques || [])].sort((a, b) => {
            const oa = Number(a.orden) || 0;
            const ob = Number(b.orden) || 0;
            if (ob !== oa) return ob - oa;
            return String(b.cursoHorarioId ?? '').localeCompare(String(a.cursoHorarioId ?? ''));
        });
        for (let i = 0; i < exceso; i += 1) {
            const bloque = sorted[i];
            if (!bloque?.cursoHorarioId) continue;
            nextSchedules = removeBlockFromSchedules(nextSchedules, cursoId, bloque.cursoHorarioId);
            removed += 1;
        }
    }

    const gen = generarBloquesAutomaticosCurso({
        schedules: nextSchedules,
        cursoId,
        turnoLabel,
        horarioSlotIndex,
        aulaMeta,
        horasPlanOverride,
    });

    const message =
        removed > 0 && gen.placed > 0
            ? `Se quitaron ${removed} bloque(s) y se generaron ${gen.placed} para alinear la cobertura.`
            : removed > 0
              ? `Se quitaron ${removed} bloque(s) para alinear la cobertura con el plan.`
              : gen.message;

    return {
        schedules: gen.schedules,
        removed,
        placed: gen.placed,
        faltante: gen.faltante,
        message,
    };
}
