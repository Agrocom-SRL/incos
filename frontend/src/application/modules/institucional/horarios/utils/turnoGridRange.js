/**
 * Ventana horaria (minutos desde medianoche) para la grilla de armado según turno del paralelo.
 * Evita mostrar franjas matutinas vacías cuando el grupo es NOCHE/TARDE.
 *
 * @param {string|null|undefined} turnoRaw — ej. URL `turno=NOCHE` o valor del paralelo
 * @returns {{ start: number, end: number }}
 */
export function getTurnoGridRangeMinutes(turnoRaw) {
    const t = String(turnoRaw || '')
        .toUpperCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    if (t === 'NOCHE') {
        // Seed `horarios`: 18:15–22:00 (bloques de 45 min)
        return { start: 18 * 60 + 15, end: 22 * 60 };
    }
    if (t === 'TARDE') {
        // Seed `horarios`: 13:45–18:15 (bloques de 45 min)
        return { start: 13 * 60 + 45, end: 18 * 60 + 15 };
    }
    if (t === 'MANANA') {
        // No hay seed de mañana todavía: mantener rango amplio (fallback)
        return { start: 7 * 60 + 30, end: 14 * 60 };
    }
    return { start: 8 * 60, end: 22 * 60 };
}

/**
 * Inicios de franja (minutos desde medianoche) que existen en el seed `horarios`
 * para SÁBADO / TARDE / CLASES. No son un aritmético +45 continuo: tras 16:30–17:15
 * el catálogo salta a 17:30–18:15 (no hay 17:00 ni 18:00 como inicio de bloque).
 */
export const SABADO_CLASES_TARDE_SLOT_STARTS_MINUTES = [
    15 * 60, // 15:00
    15 * 60 + 45, // 15:45
    16 * 60 + 30, // 16:30
    17 * 60 + 30, // 17:30
    18 * 60 + 15, // 18:15
];

/**
 * Sábado: sin turno institucional; solo franja tarde–noche (sin mañana).
 * Independiente del rango lun–vie del paralelo.
 *
 * @returns {{ start: number, end: number, fixedSlotStartsMinutes: number[] }}
 */
export function getSabadoArmadoGridRangeMinutes() {
    return {
        start: 15 * 60,
        end: 19 * 60,
        fixedSlotStartsMinutes: SABADO_CLASES_TARDE_SLOT_STARTS_MINUTES,
    };
}

function normalizeTurnoKey(turnoRaw) {
    return String(turnoRaw || '')
        .toUpperCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Turnos distintos presentes en `courseSchedules` (bloques o curso).
 * @param {object[]} courseSchedules
 * @returns {string[]}
 */
export function collectTurnosFromCourseSchedules(courseSchedules) {
    const turnos = new Set();
    for (const c of courseSchedules || []) {
        const courseTurno = normalizeTurnoKey(c.turno);
        if (courseTurno) turnos.add(courseTurno);
        for (const b of c.bloques || []) {
            const bloqueTurno = normalizeTurnoKey(b.turno);
            if (bloqueTurno) turnos.add(bloqueTurno);
        }
    }
    return [...turnos];
}

/**
 * Rango lun–vie para grilla de docente: unión de turnos si hay varios (TARDE + NOCHE).
 * Patrón alineado con matrícula (`useMatriculaDetailSchedules`).
 *
 * @param {object[]} courseSchedules
 * @param {string|null|undefined} turnoLabel — fallback si los bloques no traen turno
 */
export function resolveDocenteGrillaGridRangeMinutes(courseSchedules, turnoLabel = null) {
    let turnos = collectTurnosFromCourseSchedules(courseSchedules);
    if (!turnos.length && turnoLabel) {
        turnos = [normalizeTurnoKey(turnoLabel)].filter(Boolean);
    }
    if (!turnos.length) return getTurnoGridRangeMinutes(null);
    if (turnos.length === 1) return getTurnoGridRangeMinutes(turnos[0]);
    const ranges = turnos.map(getTurnoGridRangeMinutes);
    return {
        start: Math.min(...ranges.map((r) => r.start)),
        end: Math.max(...ranges.map((r) => r.end)),
    };
}

/**
 * Sábado en grilla docente: extiende hasta 22:00 si hay turno NOCHE en los bloques.
 */
export function resolveDocenteGrillaSabadoRangeMinutes(courseSchedules) {
    const base = getSabadoArmadoGridRangeMinutes();
    const turnos = collectTurnosFromCourseSchedules(courseSchedules);
    if (turnos.includes('NOCHE')) {
        return { ...base, end: Math.max(base.end, 22 * 60) };
    }
    return base;
}
