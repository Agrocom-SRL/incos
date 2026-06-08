/**
 * GET /horarios/docentes/:docenteId/grilla-conflictos — grilla semanal del docente y pares en choque.
 */

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

function buildParalelosInvolucrados(scheduleRows, paresConflicto) {
  const map = new Map();
  const add = (pgId, nombre, turno) => {
    const id = Number(pgId);
    if (!Number.isFinite(id) || id < 1) return;
    if (!map.has(id)) {
      map.set(id, {
        paraleloGestionId: id,
        paraleloNombre: nombre ?? `Paralelo #${id}`,
        turno: turno ?? null,
      });
    } else if (turno && !map.get(id).turno) {
      map.get(id).turno = turno;
    }
  };

  for (const r of scheduleRows || []) {
    add(r.paralelo_gestion_id, r.paralelo_nombre, r.paralelo_turno ?? r.horario_turno);
  }
  for (const p of paresConflicto || []) {
    add(p.paraleloGestionIdA, p.paraleloA, null);
    add(p.paraleloGestionIdB, p.paraleloB, null);
  }

  return [...map.values()].sort((a, b) =>
    String(a.paraleloNombre || '').localeCompare(String(b.paraleloNombre || '')),
  );
}

function resolveTurnoEfectivo(scheduleRows, paralelosInvolucrados) {
  for (const r of scheduleRows || []) {
    const t = r.paralelo_turno ?? r.horario_turno;
    if (t != null && String(t).trim()) return String(t).trim();
  }
  for (const p of paralelosInvolucrados || []) {
    if (p.turno) return p.turno;
  }
  return null;
}

function groupCourseSchedules(rows, docenteNombre) {
  const byCourse = new Map();
  const franjas = new Map();

  for (const r of rows || []) {
    const cursoId = Number(r.oferta_curso_id);
    if (!Number.isFinite(cursoId) || cursoId < 1) continue;

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
        docenteEnConflictoHorario: Number(r.tiene_conflicto_horario) === 1,
        bloques: [],
      });
    }

    const course = byCourse.get(cursoId);
    const horarioId = r.horario_id != null ? Number(r.horario_id) : null;
    const dia = r.dia ? String(r.dia).toUpperCase() : null;
    const horaInicio = fmtHora(r.hora_inicio);
    const horaFin = fmtHora(r.hora_fin);

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
      cursoHorarioId:
        r.asignacion_horario_id != null ? Number(r.asignacion_horario_id) : null,
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
      tieneConflicto: Number(r.tiene_conflicto_horario) === 1,
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

    const { courseSchedules, franjas: franjasOcupadas } = groupCourseSchedules(
      bundle.scheduleRows,
      docenteNombre,
    );

    const franjas = mergeFranjasCatalogo(franjasOcupadas, bundle.catalogoFranjas ?? []);
    const paralelosInvolucrados = buildParalelosInvolucrados(
      bundle.scheduleRows,
      bundle.paresConflicto,
    );
    const turnoEfectivo = resolveTurnoEfectivo(bundle.scheduleRows, paralelosInvolucrados);

    const bloquesEnConflicto = new Set();
    for (const p of bundle.paresConflicto || []) {
      if (p.bloqueAId != null) bloquesEnConflicto.add(Number(p.bloqueAId));
      if (p.bloqueBId != null) bloquesEnConflicto.add(Number(p.bloqueBId));
    }

    const paresConflicto = (bundle.paresConflicto || []).map((p) => ({
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

    return {
      docenteId: Number(t.docente_id ?? t.id),
      docenteNombre: docenteNombre || null,
      colorHex: normalizeHex(t.color_hex),
      turnoEfectivo,
      courseSchedules,
      franjas,
      paralelosInvolucrados,
      bloquesEnConflicto: [...bloquesEnConflicto],
      paresConflicto,
      lineasDetalle: Array.isArray(bundle.lineasDetalle) ? bundle.lineasDetalle : [],
    };
  }
}
