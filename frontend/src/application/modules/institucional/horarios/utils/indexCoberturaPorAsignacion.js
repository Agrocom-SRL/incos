/**
 * Índice de filas `cobertura.asignaciones` (GET grilla-horario) por asignacion_docente_id.
 */
export function indexCoberturaPorAsignacion(coberturaGrilla) {
    const rows = coberturaGrilla?.asignaciones;
    if (!Array.isArray(rows)) return new Map();

    const map = new Map();
    for (const row of rows) {
        const id = Number(row.asignacion_docente_id ?? row.asignacionDocenteId);
        if (!Number.isFinite(id) || id < 1) continue;
        map.set(id, {
            horasRequeridas: Number(row.horas_requeridas ?? row.horasRequeridas) || 0,
            bloquesAsignados: Number(row.bloques_asignados ?? row.bloquesAsignados) || 0,
            ok: row.ok === true,
            asignatura: row.asignatura ?? null,
        });
    }
    return map;
}
