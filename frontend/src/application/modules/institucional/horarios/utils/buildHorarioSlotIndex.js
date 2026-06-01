const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

/** @param {unknown} raw */
export function normalizeHoraHm(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return `${String(parseInt(m[1], 10)).padStart(2, '0')}:${m[2]}`;
}

export function slotKey(dia, horaInicio, horaFin) {
  const hi = normalizeHoraHm(horaInicio);
  const hf = normalizeHoraHm(horaFin);
  if (!dia || !hi || !hf) return null;
  return `${String(dia).toUpperCase()}|${hi}|${hf}`;
}

/**
 * Índice franja → horario_id desde payload grilla-horario.
 * @param {object|null} grillaPayload
 */
export function buildHorarioSlotIndexFromGrilla(grillaPayload) {
  const map = new Map();
  const grilla = grillaPayload?.grilla ?? {};
  for (const dia of DIAS) {
    for (const b of grilla[dia] || []) {
      const key = slotKey(dia, b.hora_inicio, b.hora_fin);
      const hid = Number(b.horario_id);
      if (key && Number.isFinite(hid) && hid > 0) {
        map.set(key, hid);
      }
    }
  }
  return map;
}

/**
 * @param {object} bloque
 * @param {Map<string, number>} horarioIndex
 */
export function resolveHorarioIdForBloque(bloque, horarioIndex) {
  const fromBloque = Number(bloque?.horarioId);
  if (Number.isFinite(fromBloque) && fromBloque > 0) {
    const key = slotKey(bloque.dia, bloque.horaInicio, bloque.horaFin);
    const fromSlot = key ? horarioIndex.get(key) : null;
    if (fromSlot && fromSlot !== fromBloque) return fromSlot;
    return fromBloque;
  }
  const key = slotKey(bloque.dia, bloque.horaInicio, bloque.horaFin);
  return key ? horarioIndex.get(key) ?? null : null;
}
