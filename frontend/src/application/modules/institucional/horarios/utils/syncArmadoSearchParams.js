/**
 * Normaliza query del armado: grano `pg` (paralelo_gestion_id); quita `paralelo` maestro y `turno` legacy.
 */
export function syncArmadoSearchParams(prev, { paraleloGestionId, tab }) {
    const n = new URLSearchParams(prev);
    n.delete('paralelo');
    n.delete('turno');
    if (paraleloGestionId != null && Number(paraleloGestionId) > 0) {
        n.set('pg', String(paraleloGestionId));
    }
    if (tab) n.set('tab', tab);
    return n;
}

export function armadoSearchParamsEqual(a, b) {
    return a.toString() === b.toString();
}
