/**
 * Guía de resolución de conflictos de horario del docente.
 *
 * A partir de `grilla.paresConflicto` (cada par describe dos bloques del mismo
 * docente que chocan en la misma franja, en uno o dos paralelos) arma los
 * textos que orientan al usuario: qué bloque mover y a dónde, según la pestaña.
 *
 * Estructura de cada par (ver backend DocenteGrillaConflictosPresentationMapper):
 *   { siglaA, siglaB, paraleloA, paraleloB, paraleloGestionIdA, paraleloGestionIdB,
 *     dia, horaInicio, horaFin, horarioId, descripcion }
 */

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

/** Franja legible de un par: «JUEVES 13:45–14:30». */
export function franjaConflicto(par) {
    const dia = par?.dia ? String(par.dia) : '';
    const hi = par?.horaInicio ?? '';
    const hf = par?.horaFin ?? '';
    const rango = hi || hf ? `${hi}–${hf}` : '';
    return [dia, rango].filter(Boolean).join(' ');
}

/**
 * Recomendación de solución para la pestaña de un paralelo concreto.
 * Devuelve una línea por par de conflicto que toca a ese paralelo.
 */
export function recomendacionesParaParalelo(paresConflicto = [], paraleloGestionId) {
    const id = Number(paraleloGestionId);
    return paresConflictoDeParalelo(paresConflicto, id).map((par) => {
        const esA = Number(par.paraleloGestionIdA ?? par.paralelo_gestion_id_a) === id;
        const miSigla = esA ? par.siglaA : par.siglaB;
        const otroSigla = esA ? par.siglaB : par.siglaA;
        const otroParalelo = esA ? par.paraleloB : par.paraleloA;
        const franja = franjaConflicto(par);
        const otroLabel = [otroSigla, otroParalelo ? `paralelo ${otroParalelo}` : null]
            .filter(Boolean)
            .join(' · ');
        return {
            horarioId: Number(par.horarioId ?? par.horario_id) || null,
            texto: `${franja}: ${miSigla || 'esta materia'} choca con ${otroLabel || 'otra clase del docente'}. Arrastrá el bloque en rojo de ${miSigla || 'esta materia'} a otra franja libre del turno y guardá.`,
        };
    });
}
