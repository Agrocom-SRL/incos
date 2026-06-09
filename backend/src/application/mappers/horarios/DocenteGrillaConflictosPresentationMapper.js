/**
 * GET /horarios/docentes/:docenteId/grilla-conflictos — grilla semanal del docente y pares en choque.
 */

import {
  bloquesConflictoIdsFromPares,
  resolveParalelosConflictoHorarioResolucion,
  solapeParaleloHorarioKeySet,
} from '../../utils/horarios/resolveParalelosConflictoHorarioResolucion.js';

function normalizeHex(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^[0-9A-Fa-f]{6}$/.test(s)) return `#${s}`;
  return null;
}

function fmtHora(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

function mergeFranjasCatalogo(existingFranjas, catalogoFranjas) {
  const map = new Map();
  const add = (f) => {
    const dia = f.dia ? String(f.dia).toUpperCase() : null;
    const hi = fmtHora(f.hora_inicio ?? f.horaInicio);
    const hf = fmtHora(f.hora_fin ?? f.horaFin);
    const hid = Number(f.horario_id ?? f.horarioId);
    if (!dia || !hi || !hf || !Number.isFinite(hid) || hid < 1) return;
    const key = `${dia}|${hi}|${hf}|${hid}`;
    if (!map.has(key)) {
      map.set(key, {
        dia,
        hora_inicio: hi,
        hora_fin: hf,
        horario_id: hid,
        turno: f.turno ?? null,
      });
    }
  };
  for (const f of existingFranjas || []) add(f);
  for (const f of catalogoFranjas || []) add(f);
  return [...map.values()];
}

function resolveTurnoEfectivo(scheduleRows, paralelosInvolucrados) {
  const turnos = new Set();
  for (const r of scheduleRows || []) {
    const t = r.paralelo_turno ?? r.horario_turno;
    if (t != null && String(t).trim()) {
      turnos.add(String(t).trim().toUpperCase());
    }
  }
  if (turnos.size > 1) return null;
  if (turnos.size === 1) return [...turnos][0];
  for (const p of paralelosInvolucrados || []) {
    if (p.turno) return String(p.turno).trim();
  }
  return null;
}

function groupCourseSchedules(rows, docenteNombre, bloquesConflictoIds) {
  const conflictoSet =
    bloquesConflictoIds instanceof Set ? bloquesConflictoIds : new Set(bloquesConflictoIds || []);
  const byCourse = new Map();
  const franjas = new Map();

  for (const r of rows || []) {
    const cursoId = Number(r.oferta_curso_id);
    if (!Number.isFinite(cursoId) || cursoId < 1) continue;

    const bloqueId = r.asignacion_horario_id != null ? Number(r.asignacion_horario_id) : null;

    if (!byCourse.has(cursoId)) {
      byCourse.set(cursoId, {
        cursoId,
        paraleloGestionId:
          r.paralelo_gestion_id != null ? Number(r.paralelo_gestion_id) : null,
        asignacionDocenteId:
          r.asignacion_docente_id != null ? Number(r.asignacion_docente_id) : null,
        cursoCodigo: r.curso_codigo || `OC-${cursoId}`,
        cursoColorHex: normalizeHex(r.curso_color_hex),
        materiaNombre: r.materia_nombre ?? null,
        materiaSigla: r.materia_sigla ?? null,
        carrera: r.carrera_nombre ?? null,
        docente: docenteNombre ?? null,
        docenteEnConflictoHorario: false,
        bloques: [],
      });
    }

    const course = byCourse.get(cursoId);
    const horarioId = r.horario_id != null ? Number(r.horario_id) : null;
    const dia = r.dia ? String(r.dia).toUpperCase() : null;
    const horaInicio = fmtHora(r.hora_inicio);
    const horaFin = fmtHora(r.hora_fin);
    const bloqueEnConflicto =
      (bloqueId != null && conflictoSet.has(bloqueId)) ||
      Number(r.tiene_conflicto_horario) === 1;

    if (bloqueEnConflicto) {
      course.docenteEnConflictoHorario = true;
    }

    if (horarioId && dia && horaInicio && horaFin) {
      const fk = `${dia}|${horaInicio}|${horaFin}|${horarioId}`;
      if (!franjas.has(fk)) {
        franjas.set(fk, {
          dia,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          horario_id: horarioId,
        });
      }
    }

    course.bloques.push({
      orden: r.orden_secuencia != null ? Number(r.orden_secuencia) : course.bloques.length + 1,
      cursoHorarioId: bloqueId,
      horarioId,
      asignacionDocenteId:
        r.asignacion_docente_id != null ? Number(r.asignacion_docente_id) : null,
      dia,
      horaInicio,
      horaFin,
      turno: r.paralelo_turno ?? r.horario_turno ?? null,
      paralelo: r.paralelo_nombre ?? null,
      aula: r.aula_nombre
        ? `${r.aula_codigo || ''} — ${r.aula_nombre}`.replace(/^ — /, '')
        : r.aula_codigo || null,
      aulaId: r.aula_id != null ? Number(r.aula_id) : null,
      tieneConflicto: bloqueEnConflicto,
    });
  }

  const courseSchedules = [...byCourse.values()].map((c) => {
    c.bloques.sort((a, b) => {
      const da = String(a.dia || '').localeCompare(String(b.dia || ''));
      if (da !== 0) return da;
      return String(a.horaInicio || '').localeCompare(String(b.horaInicio || ''));
    });
    c.bloques.forEach((b, idx) => {
      b.orden = idx + 1;
    });
    return c;
  });

  return { courseSchedules, franjas: [...franjas.values()] };
}

export class DocenteGrillaConflictosPresentationMapper {
  /**
   * @param {{
   *   teacher: object|null,
   *   scheduleRows: object[],
   *   paresConflicto: object[],
   *   solapeParaleloHorario?: object[],
   *   lineasDetalle: string[],
   *   catalogoFranjas?: object[],
   * }} bundle
   */
  static toResponse(bundle) {
    const t = bundle?.teacher;
    if (!t) return null;

    const docenteNombre = [t.nombres, t.apellido_paterno, t.apellido_materno]
      .filter(Boolean)
      .join(' ')
      .trim();

    const paresRaw = bundle.paresConflicto || [];
    const bloquesConflictoIds = bloquesConflictoIdsFromPares(paresRaw);
    const solapeKeys = solapeParaleloHorarioKeySet(bundle.solapeParaleloHorario ?? []);

    const { courseSchedules, franjas: franjasOcupadas } = groupCourseSchedules(
      bundle.scheduleRows,
      docenteNombre,
      bloquesConflictoIds,
    );

    const franjas = mergeFranjasCatalogo(franjasOcupadas, bundle.catalogoFranjas ?? []);

    const conflictHorarioIds = new Set();
    for (const p of paresRaw) {
      if (p.horarioId != null) conflictHorarioIds.add(Number(p.horarioId));
    }

    const paralelosInvolucrados = resolveParalelosConflictoHorarioResolucion(
      paresRaw,
      solapeKeys,
      bundle.scheduleRows,
    );
    const turnoEfectivo = resolveTurnoEfectivo(bundle.scheduleRows, paralelosInvolucrados);

    const paresConflicto = paresRaw.map((p) => ({
      bloqueAId: p.bloqueAId != null ? Number(p.bloqueAId) : null,
      bloqueBId: p.bloqueBId != null ? Number(p.bloqueBId) : null,
      horarioId: p.horarioId != null ? Number(p.horarioId) : null,
      dia: p.dia ?? null,
      horaInicio: fmtHora(p.horaInicio),
      horaFin: fmtHora(p.horaFin),
      siglaA: p.siglaA ?? null,
      siglaB: p.siglaB ?? null,
      paraleloA: p.paraleloA ?? null,
      paraleloB: p.paraleloB ?? null,
      paraleloGestionIdA: p.paraleloGestionIdA ?? null,
      paraleloGestionIdB: p.paraleloGestionIdB ?? null,
      descripcion: p.descripcion ?? null,
    }));

    const solapeParaleloHorarioKeys = [...solapeKeys];

    return {
      docenteId: Number(t.docente_id ?? t.id),
      docenteNombre: docenteNombre || null,
      colorHex: normalizeHex(t.color_hex),
      turnoEfectivo,
      courseSchedules,
      franjas,
      paralelosInvolucrados,
      conflictHorarioIds: [...conflictHorarioIds],
      bloquesConflictoIds: [...bloquesConflictoIds],
      solapeParaleloHorarioKeys,
      paresConflicto,
      lineasDetalle: Array.isArray(bundle.lineasDetalle) ? bundle.lineasDetalle : [],
    };
  }
}
