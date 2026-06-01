const TIPO_LABEL = {
  PARALELO: 'Paralelo',
  AULA: 'Aula',
  DOCENTE: 'Docente',
  VALIDACION: 'Validación',
};

/**
 * @param {object|null} payload - respuesta GET /gestiones/:id/conflictos
 */
export function mapGestionConflictosPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { gestionId: null, paralelos: [], rows: [] };
  }

  const gestionId = payload.gestion_id ?? payload.gestionId ?? null;
  const paralelos = Array.isArray(payload.paralelos) ? payload.paralelos : [];
  const conflictos = Array.isArray(payload.conflictos) ? payload.conflictos : [];

  const rows = conflictos.map((c, index) => {
    const tipo = String(c.tipo || 'PARALELO').toUpperCase();
    return {
      key: `${c.paralelo_gestion_id ?? 'pg'}-${c.horario_id ?? 'h'}-${tipo}-${index}`,
      tipo,
      tipoLabel: TIPO_LABEL[tipo] ?? tipo,
      mensaje: c.mensaje ?? '—',
      horarioId: c.horario_id ?? null,
      paraleloGestionId: c.paralelo_gestion_id ?? null,
      paraleloId: c.paralelo_id ?? null,
      paraleloNombre: c.paralelo_nombre ?? null,
      turno: c.turno ?? null,
      asignacionesInvolucradas: c.asignaciones_involucradas ?? [],
    };
  });

  return { gestionId, paralelos, rows, total: rows.length };
}
