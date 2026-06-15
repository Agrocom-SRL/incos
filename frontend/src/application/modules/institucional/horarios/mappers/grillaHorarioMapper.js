const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

/** @param {unknown} raw */
function normalizeHoraHm(raw) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return `${String(parseInt(m[1], 10)).padStart(2, '0')}:${m[2]}`;
}

/**
 * Convierte GET grilla-horario → `courseSchedules` para DocenteHorarioSemanalGrid.
 * @param {object|null} payload - cuerpo `data` del API
 * @param {{ paraleloNombre?: string|null, turno?: string|null }} [ctx]
 */
export function grillaHorarioToCourseSchedules(payload, ctx = {}) {
  const grilla = payload?.grilla ?? {};
  const byCurso = new Map();

  for (const dia of DIAS) {
    for (const b of grilla[dia] || []) {
      const cursoId = Number(b.oferta_curso_id);
      if (!Number.isFinite(cursoId) || cursoId < 1) continue;

      if (!byCurso.has(cursoId)) {
        byCurso.set(cursoId, {
          cursoId,
          asignacionDocenteId:
            b.asignacion_docente_id != null ? Number(b.asignacion_docente_id) : null,
          docenteId: b.docente_id != null ? Number(b.docente_id) : null,
          cursoCodigo: b.asignatura || '—',
          cursoColorHex: b.color_hex ?? null,
          materiaNombre: b.materia_nombre ?? null,
          materiaSigla: b.asignatura ?? null,
          carrera: b.carrera_nombre ?? null,
          docente: b.docente ?? null,
          docenteEnConflictoHorario: b.tiene_conflicto === true,
          bloques: [],
        });
      }

      const course = byCurso.get(cursoId);
      const horaInicio = normalizeHoraHm(b.hora_inicio);
      const horaFin = normalizeHoraHm(b.hora_fin);
      if (b.docente_id != null && course.docenteId == null) {
        course.docenteId = Number(b.docente_id);
      }
      if (b.tiene_conflicto === true) {
        course.docenteEnConflictoHorario = true;
      }
      course.bloques.push({
        orden: course.bloques.length + 1,
        cursoHorarioId: Number(b.asignacion_horario_id),
        horarioId: b.horario_id != null ? Number(b.horario_id) : null,
        asignacionDocenteId:
          b.asignacion_docente_id != null ? Number(b.asignacion_docente_id) : null,
        dia,
        horaInicio,
        horaFin,
        turno: ctx.turno ?? payload?.turno ?? null,
        paralelo: ctx.paraleloNombre ?? null,
        aula: b.aula_nombre ?? null,
        aulaId: b.aula_id != null ? Number(b.aula_id) : null,
        tieneConflicto: b.tiene_conflicto === true,
      });
    }
  }

  for (const course of byCurso.values()) {
    course.bloques.sort((a, b) => {
      const da = String(a.dia || '').localeCompare(String(b.dia || ''));
      if (da !== 0) return da;
      return String(a.horaInicio || '').localeCompare(String(b.horaInicio || ''));
    });
    course.bloques.forEach((bloque, idx) => {
      bloque.orden = idx + 1;
    });
  }

  return [...byCurso.values()];
}

/**
 * @param {object|null} payload
 */
export function extractGrillaHorarioMeta(payload) {
  if (!payload || typeof payload !== 'object') return null;
  return {
    paraleloGestionId: payload.paralelo_gestion_id ?? null,
    paraleloGestionEstado: payload.paralelo_gestion_estado ?? null,
    turno: payload.turno ?? null,
    conflictos: Array.isArray(payload.conflictos) ? payload.conflictos : [],
    cobertura: payload.cobertura ?? null,
  };
}

/**
 * Materias sin cobertura completa (para alertas en armado).
 * @param {object|null} payload
 */
export function missingSubjectsFromGrillaCobertura(payload) {
  const rows = payload?.cobertura?.asignaciones;
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((a) => a?.ok !== true)
    .map((a) => ({
      materiaNombre: a.asignatura ?? 'Materia',
      materiaSigla: a.asignatura ?? null,
      horasFaltantes: Math.max(
        0,
        Number(a.horas_requeridas ?? 0) - Number(a.bloques_asignados ?? 0),
      ),
    }));
}

function pickAsignacionPorOferta(asignacionesPorOferta, cursoId) {
  if (!asignacionesPorOferta || typeof asignacionesPorOferta.get !== 'function') return null;
  return asignacionesPorOferta.get(Number(cursoId)) ?? null;
}

function enrichCourseFromAsignacion(course, asig) {
  if (!asig) return course;
  const adId = Number(asig.asignacionId ?? asig.id);
  return {
    ...course,
    asignacionDocenteId:
      Number.isFinite(adId) && adId > 0 ? adId : course.asignacionDocenteId ?? null,
    cursoColorHex: asig.colorHex ?? course.cursoColorHex ?? null,
    docente: asig.docenteNombre ?? course.docente ?? null,
  };
}

/**
 * Incorpora cursos de oferta sin bloques en la grilla y enlaza asignación docente vigente.
 * @param {Array} courseSchedules
 * @param {Array<{ cursoId?: number, id?: number, materiaNombre?: string, materiaSigla?: string, colorHex?: string, docenteNombre?: string, asignacionDocenteId?: number }>} ofertaFilas
 * @param {Map<number, object>|null} [asignacionesPorOferta]
 */
export function mergeGrillaWithOfertaCursos(courseSchedules, ofertaFilas = [], asignacionesPorOferta = null) {
  const byId = new Map(
    (courseSchedules || []).map((c) => {
      const cursoId = Number(c.cursoId);
      const base = { ...c, bloques: [...(c.bloques || [])] };
      return [cursoId, enrichCourseFromAsignacion(base, pickAsignacionPorOferta(asignacionesPorOferta, cursoId))];
    }),
  );

  for (const row of ofertaFilas || []) {
    const cursoId = Number(row.cursoId ?? row.id ?? row.ofertaCursoId);
    if (!Number.isFinite(cursoId) || cursoId < 1) continue;
    const asig = pickAsignacionPorOferta(asignacionesPorOferta, cursoId);
    const horasOferta =
      row.horasSemanalesPlan != null ? Number(row.horasSemanalesPlan) : null;
    if (byId.has(cursoId)) {
      const prev = byId.get(cursoId);
      const materiaNombre = row.materiaNombre ?? prev.materiaNombre ?? null;
      const materiaSigla = row.materiaSigla ?? prev.materiaSigla ?? null;
      byId.set(
        cursoId,
        enrichCourseFromAsignacion(
          {
            ...prev,
            horasSemanalesPlan: horasOferta ?? prev.horasSemanalesPlan ?? null,
            materiaNombre,
            materiaSigla,
            cursoCodigo: materiaSigla || materiaNombre || prev.cursoCodigo,
          },
          asig,
        ),
      );
      continue;
    }
    byId.set(
      cursoId,
      enrichCourseFromAsignacion(
        {
          cursoId,
          asignacionDocenteId: row.asignacionDocenteId ?? null,
          cursoCodigo: row.materiaSigla || row.materiaNombre || '—',
          cursoColorHex: row.colorHex ?? row.cursoColorHex ?? null,
          materiaNombre: row.materiaNombre ?? null,
          materiaSigla: row.materiaSigla ?? null,
          docente: row.docenteNombre ?? row.docente ?? null,
          horasSemanalesPlan: horasOferta,
          bloques: [],
        },
        asig,
      ),
    );
  }

  return [...byId.values()].sort((a, b) =>
    String(a.cursoCodigo || '').localeCompare(String(b.cursoCodigo || '')),
  );
}
