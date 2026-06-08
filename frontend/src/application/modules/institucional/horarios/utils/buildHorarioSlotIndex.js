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

function indexFranja(map, dia, horaInicio, horaFin, horarioId) {
  const key = slotKey(dia, horaInicio, horaFin);
  const hid = Number(horarioId);
  if (key && Number.isFinite(hid) && hid > 0) {
    map.set(key, hid);
  }
}

/**
 * Índice franja → horario_id desde payload grilla-horario (bloques + catálogo del turno).
 * @param {object|null} grillaPayload
 */
export function buildHorarioSlotIndexFromGrilla(grillaPayload) {
  const map = new Map();
  const grilla = grillaPayload?.grilla ?? {};
  for (const dia of DIAS) {
    for (const b of grilla[dia] || []) {
      indexFranja(map, dia, b.hora_inicio, b.hora_fin, b.horario_id);
    }
  }
  for (const f of grillaPayload?.franjas || []) {
    indexFranja(map, f.dia, f.hora_inicio, f.hora_fin, f.horario_id);
  }
  return map;
}

/**
 * @param {object} bloque
 * @param {Map<string, number>} horarioIndex
 */
/**
 * @param {Array<{ dia: string, hora_inicio: string, hora_fin: string, horario_id: number }>} franjas
 */
export function buildHorarioSlotIndexFromFranjas(franjas = []) {
  const map = new Map();
  for (const f of franjas || []) {
    indexFranja(map, f.dia, f.hora_inicio, f.hora_fin, f.horario_id);
  }
  return map;
}

export function resolveHorarioIdForBloque(bloque, horarioIndex) {
  const key = slotKey(bloque.dia, bloque.horaInicio, bloque.horaFin);
  if (key) {
    const fromSlot = horarioIndex.get(key);
    const hid = Number(fromSlot);
    if (Number.isFinite(hid) && hid > 0) {
      return hid;
    }
  }
  const fromBloque = Number(bloque?.horarioId);
  if (Number.isFinite(fromBloque) && fromBloque > 0) {
    return fromBloque;
  }
  return null;
}

/** Franjas ya ocupadas por cualquier materia del paralelo (una materia por bloque horario). */
export function buildOccupiedSlotKeysFromSchedules(schedules) {
  const set = new Set();
  for (const course of schedules || []) {
    for (const b of course.bloques || []) {
      const key = slotKey(b.dia, b.horaInicio, b.horaFin);
      if (key) set.add(key);
    }
  }
  return set;
}

/**
 * Opciones de inicio (minutos) para el modal «Añadir bloque», solo franjas libres.
 */
export function buildFreeSlotOptionsForDay({
  dia,
  rangeStart,
  rangeEnd,
  step = 45,
  occupiedKeys,
  sabadoFixedStarts = null,
}) {
  const list =
    dia === 'SABADO' && Array.isArray(sabadoFixedStarts) && sabadoFixedStarts.length
      ? sabadoFixedStarts
      : (() => {
          const mins = [];
          for (let m = rangeStart; m < rangeEnd; m += step) mins.push(m);
          return mins;
        })();

  const endForStart = (startM) => startM + step;
  const h = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  return list
    .filter((startM) => {
      const key = slotKey(dia, h(startM), h(endForStart(startM)));
      return key && !occupiedKeys?.has(key);
    })
    .map((startM) => {
      const label = `${h(startM)}–${h(endForStart(startM))}`;
      return { value: startM, label };
    });
}
