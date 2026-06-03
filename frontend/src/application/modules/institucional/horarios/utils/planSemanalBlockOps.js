/** @param {unknown} v */
export function horaToMinutes(v) {
    if (v == null || v === '') return null;
    if (typeof v === 'string') {
        const m = v.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (!m) return null;
        return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    }
    if (v instanceof Date && !Number.isNaN(v.getTime())) {
        return v.getHours() * 60 + v.getMinutes();
    }
    return null;
}

export function minutesToHoraStr(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function blockDurationMinutes(horaInicio, horaFin) {
    const a = horaToMinutes(horaInicio);
    const b = horaToMinutes(horaFin);
    if (a == null || b == null || b <= a) return 45;
    return b - a;
}

/** @param {object[]} courseSchedules */
export function findCourseAndBlock(courseSchedules, cursoId, cursoHorarioId) {
    const course = (courseSchedules || []).find((c) => Number(c.cursoId) === Number(cursoId));
    const block = (course?.bloques || []).find(
        (b) => String(b.cursoHorarioId) === String(cursoHorarioId),
    );
    return { course, block };
}

/** Bloque de otra materia (o la misma) que empieza en la franja indicada. */
export function findBlockAtSlot(
    courseSchedules,
    targetDia,
    targetSlotMinutes,
    excludeCursoHorarioId = null,
) {
    const diaTarget = String(targetDia || '').toUpperCase();
    const slotM = Number(targetSlotMinutes);
    if (!diaTarget || !Number.isFinite(slotM)) {
        return { course: null, block: null };
    }

    for (const course of courseSchedules || []) {
        for (const b of course.bloques || []) {
            if (
                excludeCursoHorarioId != null &&
                String(b.cursoHorarioId) === String(excludeCursoHorarioId)
            ) {
                continue;
            }
            const dia = String(b.dia || '').toUpperCase();
            const start = horaToMinutes(b.horaInicio);
            if (dia === diaTarget && start === slotM) {
                return { course, block: b };
            }
        }
    }
    return { course: null, block: null };
}

/** @param {object[]} courseSchedules */
export function moveBlockToSlot(courseSchedules, { cursoId, cursoHorarioId, targetDia, targetSlotMinutes }) {
    return courseSchedules.map((course) => {
        if (Number(course.cursoId) !== Number(cursoId)) return course;
        const nextBloques = (course.bloques || []).map((b) => {
            if (String(b.cursoHorarioId) !== String(cursoHorarioId)) return b;
            const dur = blockDurationMinutes(b.horaInicio, b.horaFin);
            const startStr = minutesToHoraStr(targetSlotMinutes);
            const endStr = minutesToHoraStr(targetSlotMinutes + dur);
            return {
                ...b,
                dia: targetDia,
                horaInicio: startStr,
                horaFin: endStr,
            };
        });
        return { ...course, bloques: nextBloques };
    });
}

/**
 * Mueve un bloque a la franja destino; si otra materia del paralelo ya la ocupa, intercambia ambos bloques.
 */
export function swapOrMoveBlockToSlot(
    courseSchedules,
    { cursoId, cursoHorarioId, targetDia, targetSlotMinutes, sourceDia, sourceSlotMinutes },
) {
    const { course: targetCourse, block: targetBlock } = findBlockAtSlot(
        courseSchedules,
        targetDia,
        targetSlotMinutes,
        cursoHorarioId,
    );

    const sourceM = Number(sourceSlotMinutes);
    const canSwap =
        targetBlock &&
        targetCourse &&
        Number(targetCourse.cursoId) !== Number(cursoId) &&
        sourceDia &&
        Number.isFinite(sourceM);

    if (!canSwap) {
        return moveBlockToSlot(courseSchedules, {
            cursoId,
            cursoHorarioId,
            targetDia,
            targetSlotMinutes,
        });
    }

    const afterFirst = moveBlockToSlot(courseSchedules, {
        cursoId,
        cursoHorarioId,
        targetDia,
        targetSlotMinutes,
    });

    return moveBlockToSlot(afterFirst, {
        cursoId: targetCourse.cursoId,
        cursoHorarioId: targetBlock.cursoHorarioId,
        targetDia: sourceDia,
        targetSlotMinutes: sourceM,
    });
}

export function removeBlockFromSchedules(courseSchedules, cursoId, cursoHorarioId) {
    return courseSchedules.map((course) => {
        if (Number(course.cursoId) !== Number(cursoId)) return course;
        return {
            ...course,
            bloques: (course.bloques || []).filter((b) => String(b.cursoHorarioId) !== String(cursoHorarioId)),
        };
    });
}

export function appendBlockToCourse(courseSchedules, cursoId, bloque) {
    return courseSchedules.map((course) => {
        if (Number(course.cursoId) !== Number(cursoId)) return course;
        const bloques = [...(course.bloques || [])];
        const maxOrden = bloques.reduce((m, b) => Math.max(m, Number(b.orden) || 0), 0);
        bloques.push({
            ...bloque,
            orden: maxOrden + 1,
        });
        return { ...course, bloques };
    });
}
