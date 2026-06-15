/**
 * Paralelos editables en pantalla de resolución de conflictos docente.
 *
 * Regla por par (misma franja horario_id):
 * - Mismo paralelo_gestion → ese paralelo.
 * - Entre paralelos distintos → solo el/los que tienen solape de ofertas en la celda (vista 124).
 * - Entre paralelos sin solape en ninguno → ambos (el docente debe mover uno).
 */

export function solapeParaleloHorarioKey(paraleloGestionId, horarioId) {
  const pg = Number(paraleloGestionId);
  const h = Number(horarioId);
  if (!Number.isFinite(pg) || pg < 1 || !Number.isFinite(h) || h < 1) return null;
  return `${pg}|${h}`;
}

/** @param {Array<{ paraleloGestionId?: number, horarioId?: number }>} rows */
export function solapeParaleloHorarioKeySet(rows = []) {
  const set = new Set();
  for (const row of rows) {
    const pg = Number(row.paraleloGestionId ?? row.paralelo_gestion_id);
    const h = Number(row.horarioId ?? row.horario_id);
    const key = solapeParaleloHorarioKey(pg, h);
    if (key) set.add(key);
  }
  return set;
}

function addParaleloMeta(metaByPg, pgId, nombre, turno) {
  const id = Number(pgId);
  if (!Number.isFinite(id) || id < 1) return;
  if (!metaByPg.has(id)) {
    metaByPg.set(id, {
      paraleloGestionId: id,
      paraleloNombre: nombre ?? `Paralelo #${id}`,
      turno: turno ?? null,
    });
  }
}

/**
 * @param {Array} paresConflicto
 * @param {Set<string>} solapeKeys
 * @param {Array} [scheduleRows] — metadatos nombre/turno
 */
export function resolveParalelosConflictoHorarioResolucion(
  paresConflicto = [],
  solapeKeys = new Set(),
  scheduleRows = [],
) {
  const metaByPg = new Map();
  for (const r of scheduleRows) {
    addParaleloMeta(
      metaByPg,
      r.paralelo_gestion_id,
      r.paralelo_nombre,
      r.paralelo_turno ?? r.horario_turno,
    );
  }

  const pgIds = new Set();

  for (const p of paresConflicto) {
    const a = Number(p.paraleloGestionIdA ?? p.paralelo_gestion_id_a);
    const b = Number(p.paraleloGestionIdB ?? p.paralelo_gestion_id_b);
    const h = Number(p.horarioId ?? p.horario_id);
    if (!Number.isFinite(h) || h < 1) continue;

    addParaleloMeta(metaByPg, a, p.paraleloA ?? p.paralelo_a, null);
    addParaleloMeta(metaByPg, b, p.paraleloB ?? p.paralelo_b, null);

    const keyA = solapeParaleloHorarioKey(a, h);
    const keyB = solapeParaleloHorarioKey(b, h);
    const solapeA = keyA != null && solapeKeys.has(keyA);
    const solapeB = keyB != null && solapeKeys.has(keyB);

    const addPg = (pg) => {
      if (Number.isFinite(pg) && pg > 0) pgIds.add(pg);
    };

    if (a === b) {
      addPg(a);
    } else if (solapeA && solapeB) {
      addPg(a);
      addPg(b);
    } else if (solapeA) {
      addPg(a);
    } else if (solapeB) {
      addPg(b);
    } else {
      addPg(a);
      addPg(b);
    }
  }

  return [...pgIds]
    .map((id) => metaByPg.get(id) ?? {
      paraleloGestionId: id,
      paraleloNombre: `Paralelo #${id}`,
      turno: null,
    })
    .sort((x, y) =>
      String(x.paraleloNombre || '').localeCompare(String(y.paraleloNombre || '')),
    );
}

/** @param {Array} paresConflicto */
export function bloquesConflictoIdsFromPares(paresConflicto = []) {
  const ids = new Set();
  for (const p of paresConflicto) {
    const a = Number(p.bloqueAId ?? p.bloque_a_id);
    const b = Number(p.bloqueBId ?? p.bloque_b_id);
    if (Number.isFinite(a) && a > 0) ids.add(a);
    if (Number.isFinite(b) && b > 0) ids.add(b);
  }
  return ids;
}

/**
 * horario_id a resaltar en la pestaña de un paralelo concreto.
 * @param {number} paraleloGestionId
 * @param {Array} paresConflicto
 * @param {Set<string>} solapeKeys
 */
export function conflictHorarioIdsForParaleloTab(
  paraleloGestionId,
  paresConflicto = [],
  solapeKeys = new Set(),
) {
  const pg = Number(paraleloGestionId);
  const ids = new Set();
  if (!Number.isFinite(pg) || pg < 1) return ids;

  for (const p of paresConflicto) {
    const a = Number(p.paraleloGestionIdA ?? p.paralelo_gestion_id_a);
    const b = Number(p.paraleloGestionIdB ?? p.paralelo_gestion_id_b);
    const h = Number(p.horarioId ?? p.horario_id);
    if (!Number.isFinite(h) || h < 1) continue;

    const keyA = solapeParaleloHorarioKey(a, h);
    const keyB = solapeParaleloHorarioKey(b, h);
    const solapeA = keyA != null && solapeKeys.has(keyA);
    const solapeB = keyB != null && solapeKeys.has(keyB);

    const incluyePg =
      a === b
        ? pg === a
        : pg === a
          ? solapeA || (!solapeA && !solapeB)
          : pg === b
            ? solapeB || (!solapeA && !solapeB)
            : false;

    if (incluyePg) ids.add(h);
  }

  return ids;
}
