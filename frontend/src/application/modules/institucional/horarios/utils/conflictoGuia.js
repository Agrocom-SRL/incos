/**
 * Guía de resolución de conflictos de horario del docente.
 *
 * A partir de `grilla.paresConflicto` (cada par describe dos bloques del mismo
 * docente que chocan en la misma franja, en uno o dos paralelos) arma los
 * textos que orientan al usuario.
 *
 * Estructura de cada par (backend DocenteGrillaConflictosPresentationMapper):
 *   { bloqueAId, bloqueBId, horarioId, dia, horaInicio, horaFin,
 *     siglaA, siglaB, paraleloA, paraleloB, paraleloGestionIdA, paraleloGestionIdB }
 *
 * El backend solo expone la SIGLA de la materia; el NOMBRE se resuelve desde los
 * `courseSchedules` del frontend (cada bloque trae `materiaNombre` y su
 * `cursoHorarioId` coincide con `bloqueAId`/`bloqueBId`).
 */

/** Mapa cursoHorarioId (= bloqueId) → nombre de materia, desde courseSchedules. */
export function buildBloqueMateriaNombreMap(...courseSchedulesLists) {
    const map = new Map();
    for (const lista of courseSchedulesLists) {
        for (const course of lista || []) {
            const nombre = course.materiaNombre || course.materiaSigla || null;
            for (const b of course.bloques || []) {
                const id = Number(b.cursoHorarioId);
                if (Number.isFinite(id) && !map.has(id)) map.set(id, nombre);
            }
        }
    }
    return map;
}

/** Pares de conflicto que involucran a un paralelo-gestión concreto. */
export function paresConflictoDeParalelo(paresConflicto = [], paraleloGestionId) {
    const id = Number(paraleloGestionId);
    if (!Number.isFinite(id) || id < 1) return [];
    return (paresConflicto || []).filter(
        (p) =>
            Number(p.paraleloGestionIdA ?? p.paralelo_gestion_id_a) === id ||
            Number(p.paraleloGestionIdB ?? p.paralelo_gestion_id_b) === id,
    );
}

/**
 * El backend trae el mismo choque en ambas direcciones (A↔B y B↔A). Deduplica
 * por el par de bloques + franja (sin importar el orden).
 */
export function paresConflictoUnicos(paresConflicto = []) {
    const seen = new Set();
    const out = [];
    for (const p of paresConflicto || []) {
        const a = Number(p.bloqueAId);
        const b = Number(p.bloqueBId);
        const key = [Math.min(a, b), Math.max(a, b), Number(p.horarioId)].join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(p);
    }
    return out;
}

/** «MARTES de 13:45 a 14:30». */
export function franjaConflicto(par) {
    const dia = par?.dia ? String(par.dia) : '';
    const hi = par?.horaInicio ?? '';
    const hf = par?.horaFin ?? '';
    const rango = hi && hf ? `de ${hi} a ${hf}` : hi || hf || '';
    return [dia, rango].filter(Boolean).join(' ');
}

const nombreMateriaDeBloque = (bloqueNombreMap, bloqueId, siglaFallback) =>
    bloqueNombreMap?.get(Number(bloqueId)) || siglaFallback || 'una materia';

/**
 * Líneas para el tab del docente (solo lectura): nombre de materia, día/hora y
 * de qué paralelo es cada materia.
 */
export function lineasConflictoDocente(paresConflicto = [], bloqueNombreMap) {
    return paresConflictoUnicos(paresConflicto).map((p) => {
        const nombreA = nombreMateriaDeBloque(bloqueNombreMap, p.bloqueAId, p.siglaA);
        const nombreB = nombreMateriaDeBloque(bloqueNombreMap, p.bloqueBId, p.siglaB);
        return `${franjaConflicto(p)}: ${nombreA} (paralelo ${p.paraleloA ?? '—'}) choca con ${nombreB} (paralelo ${p.paraleloB ?? '—'}).`;
    });
}

/** «13:45» → minutos desde medianoche (825). */
export function horaInicioToMinutes(horaInicio) {
    const [h, m] = String(horaInicio || '')
        .split(':')
        .map((n) => Number(n));
    if (!Number.isFinite(h)) return null;
    return h * 60 + (Number.isFinite(m) ? m : 0);
}

/**
 * Ayuda contextual por franja para la pestaña de un paralelo: una entrada por
 * choque, con la clave de slot (`DIA-minutos`) para anclar el popover en la celda.
 */
export function ayudaConflictoParalelo(paresConflicto = [], paraleloGestionId, bloqueNombreMap) {
    const id = Number(paraleloGestionId);
    const propios = paresConflictoUnicos(paresConflictoDeParalelo(paresConflicto, id));
    return propios
        .map((p) => {
            const esA = Number(p.paraleloGestionIdA ?? p.paralelo_gestion_id_a) === id;
            const miBloqueId = esA ? p.bloqueAId : p.bloqueBId;
            const otroBloqueId = esA ? p.bloqueBId : p.bloqueAId;
            const miNombre = nombreMateriaDeBloque(bloqueNombreMap, miBloqueId, esA ? p.siglaA : p.siglaB);
            const otroNombre = nombreMateriaDeBloque(
                bloqueNombreMap,
                otroBloqueId,
                esA ? p.siglaB : p.siglaA,
            );
            const otroParalelo = esA ? p.paraleloB : p.paraleloA;
            const min = horaInicioToMinutes(p.horaInicio);
            return {
                slotKey: min != null ? `${String(p.dia).toUpperCase()}-${min}` : null,
                franja: franjaConflicto(p),
                miNombre,
                otroNombre,
                otroParalelo,
            };
        })
        .filter((r) => r.slotKey);
}
