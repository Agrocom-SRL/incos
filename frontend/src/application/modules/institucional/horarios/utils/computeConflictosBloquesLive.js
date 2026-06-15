/**
 * Conflictos docente en grilla: identidad de celda = horario_id del catálogo (vista 36/128).
 * Solo cuenta bloques del docente en conflicto (no otros docentes del paralelo).
 */

import {
  resolveHorarioIdForBloque,
  slotKey,
} from '@application-institucional/horarios/utils/buildHorarioSlotIndex';

function minutesToHm(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function normalizeDocenteNombre(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Solo cursos/asignaciones del docente en resolución de conflictos. */
export function filterSchedulesForDocente(schedules, docenteNombre) {
  const target = normalizeDocenteNombre(docenteNombre);
  if (!target) return [];
  return (schedules || []).filter((course) => {
    const name = normalizeDocenteNombre(course?.docente);
    return name.length > 0 && name === target;
  });
}

function flattenBlocksWithHorarioId(schedules, horarioIndex) {
  const blocks = [];
  for (const course of schedules || []) {
    for (const bloque of course.bloques || []) {
      if (!bloque?.dia || !bloque?.horaInicio) continue;
      const horarioId = resolveHorarioIdForBloque(bloque, horarioIndex);
      const id = bloque.cursoHorarioId;
      blocks.push({
        cursoHorarioId: id != null && Number.isFinite(Number(id)) ? Number(id) : null,
        horarioId: Number.isFinite(Number(horarioId)) && Number(horarioId) > 0 ? Number(horarioId) : null,
        dia: String(bloque.dia).toUpperCase(),
        horaInicio: bloque.horaInicio,
        horaFin: bloque.horaFin ?? null,
      });
    }
  }
  return blocks;
}

function collectCursoHorarioIds(schedules) {
  const ids = new Set();
  for (const course of schedules || []) {
    for (const bloque of course.bloques || []) {
      const id = bloque.cursoHorarioId;
      if (id != null && Number.isFinite(Number(id))) ids.add(Number(id));
    }
  }
  return ids;
}

/** horario_id en choque según pares de la vista backend. */
export function conflictHorarioIdsFromPares(paresConflicto) {
  const ids = new Set();
  for (const p of paresConflicto || []) {
    const hid = Number(p.horarioId ?? p.horario_id);
    if (Number.isFinite(hid) && hid > 0) ids.add(hid);
  }
  return ids;
}

/**
 * Plan agregado del docente: borradores de paralelo solo aportan sus cursos, no la grilla entera.
 * @param {string|null} docenteNombre
 */
export function buildMergedDocenteSchedules(
  docenteDraftSchedules,
  paraleloStates,
  paralelosInvolucrados,
  docenteNombre = null,
) {
  const replacedPgIds = new Set();
  const replacedCursoHorarioIds = new Set();
  const merged = [];

  for (const meta of paralelosInvolucrados || []) {
    const pgId = Number(meta.paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) continue;
    const draft = paraleloStates[pgId]?.draftSchedules;
    if (!Array.isArray(draft) || draft.length === 0) continue;

    const draftDocente = filterSchedulesForDocente(draft, docenteNombre);
    if (!draftDocente.length) continue;

    replacedPgIds.add(pgId);
    merged.push(...draftDocente);
    for (const id of collectCursoHorarioIds(draftDocente)) {
      replacedCursoHorarioIds.add(id);
    }
  }

  for (const course of docenteDraftSchedules || []) {
    const pgId =
      course.paraleloGestionId != null ? Number(course.paraleloGestionId) : null;
    if (pgId != null && replacedPgIds.has(pgId)) continue;

    const bloques = (course.bloques || []).filter((bloque) => {
      const id = bloque.cursoHorarioId;
      if (id != null && replacedCursoHorarioIds.has(Number(id))) return false;
      return true;
    });
    if (!bloques.length) continue;
    merged.push({ ...course, bloques });
  }

  return merged;
}

/** horario_id donde el docente tiene 2+ bloques (misma celda del catálogo). */
export function computeConflictHorarioIds(mergedSchedules, horarioIndex) {
  const byHorario = new Map();
  for (const bloque of flattenBlocksWithHorarioId(mergedSchedules, horarioIndex)) {
    const hid = bloque.horarioId;
    if (!Number.isFinite(hid) || hid < 1) continue;
    byHorario.set(hid, (byHorario.get(hid) || 0) + 1);
  }

  const conflictIds = new Set();
  for (const [hid, count] of byHorario) {
    if (count >= 2) conflictIds.add(hid);
  }
  return conflictIds;
}

/**
 * Resuelve horario_id de una celda día×fila de la grilla.
 * @param {Map<string, number>|null} horarioIndex
 */
export function resolveHorarioIdForGridCell(dia, slotMinutes, cellItems, slotStepMinutes, horarioIndex) {
  for (const item of cellItems || []) {
    const fromItem = Number(item.horarioId);
    if (Number.isFinite(fromItem) && fromItem > 0) return fromItem;
    if (horarioIndex) {
      const key = slotKey(
        item.diaDb ?? dia,
        item.horaInicio,
        item.horaFin ?? (slotStepMinutes > 0 ? minutesToHm(slotMinutes + slotStepMinutes) : null),
      );
      const resolved = key ? horarioIndex.get(key) : null;
      if (resolved) return resolved;
    }
  }

  if (!horarioIndex || !(slotStepMinutes > 0)) return null;
  const hi = minutesToHm(slotMinutes);
  const hf = minutesToHm(slotMinutes + slotStepMinutes);
  const key = slotKey(dia, hi, hf);
  return key ? horarioIndex.get(key) ?? null : null;
}

/**
 * ¿Celda en conflicto docente? Solo true si el horario_id de la celda está en el set.
 * @param {Set<number>} conflictHorarioIds
 * @param {Map<string, number>|null} horarioIndex
 */
export function isConflictGridCell(
  dia,
  slotMinutes,
  cellItems,
  slotStepMinutes,
  conflictHorarioIds,
  horarioIndex = null,
) {
  if (!conflictHorarioIds?.size) return false;

  const cellHorarioId = resolveHorarioIdForGridCell(
    dia,
    slotMinutes,
    cellItems,
    slotStepMinutes,
    horarioIndex,
  );
  return cellHorarioId != null && conflictHorarioIds.has(Number(cellHorarioId));
}
