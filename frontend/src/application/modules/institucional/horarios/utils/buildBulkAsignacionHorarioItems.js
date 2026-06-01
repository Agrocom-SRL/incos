import { resolveHorarioIdForBloque } from './buildHorarioSlotIndex.js';

function bloqueSignature(b) {
  return [
    String(b.dia || '').toUpperCase(),
    b.horaInicio ?? '',
    b.horaFin ?? '',
    b.aulaId ?? '',
    b.orden ?? '',
  ].join('|');
}

function flattenSchedules(schedules) {
  const list = [];
  for (const course of schedules || []) {
    const adId = Number(course.asignacionDocenteId);
    const cursoId = Number(course.cursoId);
    for (const b of course.bloques || []) {
      const rawId = b.cursoHorarioId;
      const idNum = Number(rawId);
      list.push({
        cursoId,
        asignacionDocenteId: Number.isFinite(adId) && adId > 0 ? adId : Number(b.asignacionDocenteId),
        bloque: b,
        idNum: Number.isFinite(idNum) && idNum > 0 ? idNum : null,
        isTemp: String(rawId).startsWith('temp-'),
      });
    }
  }
  return list;
}

/**
 * Diff server vs draft → operaciones bulk API.
 * @returns {{ items: object[], incomplete: boolean }}
 */
export function buildBulkAsignacionHorarioItems(serverSchedules, draftSchedules, horarioIndex) {
  const serverFlat = flattenSchedules(serverSchedules);
  const draftFlat = flattenSchedules(draftSchedules);

  const serverById = new Map();
  for (const row of serverFlat) {
    if (row.idNum) serverById.set(row.idNum, row);
  }

  const draftById = new Map();
  for (const row of draftFlat) {
    if (row.idNum) draftById.set(row.idNum, row);
  }

  const items = [];
  let incomplete = false;

  for (const row of serverFlat) {
    if (!row.idNum) continue;
    if (!draftById.has(row.idNum)) {
      items.push({ op: 'delete', id: row.idNum });
    }
  }

  for (const row of draftFlat) {
    const { bloque, asignacionDocenteId, idNum, isTemp } = row;
    const horarioId = resolveHorarioIdForBloque(bloque, horarioIndex);

    if (isTemp || !idNum) {
      if (!Number.isFinite(asignacionDocenteId) || asignacionDocenteId < 1 || !horarioId) {
        incomplete = true;
        continue;
      }
      items.push({
        op: 'create',
        asignacion_docente_id: asignacionDocenteId,
        horario_id: horarioId,
        aula_id: bloque.aulaId ?? null,
        orden_secuencia: Number(bloque.orden) || 1,
      });
      continue;
    }

    const serverRow = serverById.get(idNum);
    if (!serverRow) continue;

    if (bloqueSignature(serverRow.bloque) !== bloqueSignature(bloque)) {
      if (!horarioId) {
        incomplete = true;
        continue;
      }
      items.push({
        op: 'update',
        id: idNum,
        asignacion_docente_id: asignacionDocenteId || serverRow.asignacionDocenteId,
        horario_id: horarioId,
        aula_id: bloque.aulaId ?? null,
        orden_secuencia: Number(bloque.orden) || 1,
      });
    }
  }

  return { items, incomplete };
}
