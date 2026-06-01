/**
 * Mapea el bundle crudo del repositorio a la respuesta HTTP del detalle de docente.
 * `profile` combina datos de ficha (etiquetas legibles) con campos necesarios para edición
 * (ci, nombres, IDs de estado civil y geografía de residencia en cascada, etc.).
 */

function fmtDate(d) {
  if (d == null || d === '') return null;
  try {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return String(d);
    return x.toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

/** Jerarquía legible (alineada a ficha estudiante / lugar geográfico): departamento, municipio, provincia, país. */
function formatLugarResidencia(row) {
  const parts = [
    row.departamento_nombre,
    row.municipio_nombre,
    row.provincia_nombre,
    row.pais_nombre,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

/** #RRGGBB o RRGGBB desde seeders (cursos / carreras); inválido → null. */
function normalizeHex(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  if (/^[0-9A-Fa-f]{6}$/.test(s)) return `#${s}`;
  return null;
}

function groupSchedules(scheduleRows, assignments = []) {
  const courseMetaByCode = new Map();
  for (const a of assignments || []) {
    const code = a?.cursoCodigo ? String(a.cursoCodigo) : null;
    if (!code || courseMetaByCode.has(code)) continue;
    courseMetaByCode.set(code, {
      materiaNombre: a?.materia ?? null,
      materiaSigla: a?.siglaMateria ?? null,
      carrera: a?.carrera ?? null,
      periodoParalelo: a?.periodoParalelo ?? null,
    });
  }

  const byCourse = new Map();
  for (const r of scheduleRows || []) {
    const code = r.curso_codigo || '—';
    const meta = courseMetaByCode.get(String(code)) || {};
    if (!byCourse.has(code)) {
      byCourse.set(code, {
        cursoCodigo: code,
        cursoColorHex: normalizeHex(r.curso_color_hex),
        materiaNombre: meta.materiaNombre ?? null,
        materiaSigla: meta.materiaSigla ?? null,
        carrera: meta.carrera ?? null,
        periodoParalelo: meta.periodoParalelo ?? null,
        bloques: [],
      });
    }
    const g = byCourse.get(code);
    g.bloques.push({
      orden: r.orden_secuencia,
      dia: r.dia,
      horaInicio: r.hora_inicio,
      horaFin: r.hora_fin,
      bloqueNombre: r.bloque_nombre,
      tipoHorario: r.tipo_horario,
      turno: r.horario_turno ?? null,
      paralelo: r.paralelo_nombre ?? null,
      aula: r.aula_nombre ? `${r.aula_codigo || ''} — ${r.aula_nombre}`.replace(/^ — /, '') : r.aula_codigo || null,
      aulaCategoria: r.aula_categoria,
    });
  }
  return [...byCourse.values()];
}

export class TeacherDetailPresentationMapper {
  /**
   * @param {{ teacher: Object|null, assignments: Object[], schedules: Object[] }} bundle
   */
  static toResponse(bundle) {
    const t = bundle?.teacher;
    if (!t) {
      return null;
    }

    const nombreCompleto = [t.nombres, t.apellido_paterno, t.apellido_materno].filter(Boolean).join(' ').trim();
    const ciCompleto = t.expedicion ? `${t.ci || ''} ${t.expedicion}`.trim() : String(t.ci || '');

    const profile = {
      nombreCompleto: nombreCompleto || null,
      ciCompleto,
      ci: t.ci ?? null,
      expedicion: t.expedicion ?? null,
      nombres: t.nombres ?? null,
      apellidoPaterno: t.apellido_paterno ?? null,
      apellidoMaterno: t.apellido_materno ?? null,
      fechaNacimiento: fmtDate(t.fecha_nacimiento),
      genero: t.genero,
      nacionalidad: t.nacionalidad,
      estadoCivilId: t.estado_civil_id != null && t.estado_civil_id !== '' ? Number(t.estado_civil_id) : null,
      municipioResidenciaId: t.municipio_residencia_id != null && t.municipio_residencia_id !== '' ? Number(t.municipio_residencia_id) : null,
      residenciaProvinciaId:
        t.residencia_provincia_id != null && t.residencia_provincia_id !== '' ? Number(t.residencia_provincia_id) : null,
      residenciaDepartamentoId:
        t.residencia_departamento_id != null && t.residencia_departamento_id !== ''
          ? Number(t.residencia_departamento_id)
          : null,
      telefono: t.telefono,
      celular: t.celular,
      emailPersonal: t.email_personal,
      direccion: t.direccion,
      zona: t.zona,
      paisResidencia: t.pais_nombre || null,
      lugarResidencia: formatLugarResidencia(t),
      idiomaMaterno: null,
      idiomaSecundario: null,
      estadoCivil: t.estado_civil_nombre,
      tituloProfesional: t.titulo_profesional,
      especialidad: t.especialidad,
      nivelAcademico: t.nivel_academico,
      institucionEgreso: t.institucion_egreso,
      anioEgreso: t.anio_egreso,
      aniosExperiencia: t.anios_experiencia,
      fechaContratacion: fmtDate(t.fecha_contratacion),
      fechaRetiro: fmtDate(t.fecha_retiro),
      tipoContrato: t.tipo_contrato,
      estadoLaboral: t.estado_laboral,
      observaciones: t.observaciones,
      registroActivo: Boolean(t.activo),
      colorHex: normalizeHex(t.color_hex),
      maxHorasSemana: t.max_horas_semana != null ? Number(t.max_horas_semana) : 20,
      maxHorasMes: t.max_horas_mes != null ? Number(t.max_horas_mes) : 80,
      creadoEn: t.created_at,
      actualizadoEn: t.updated_at,
    };

    const usuarioId = t.usuario_id != null && t.usuario_id !== '' ? Number(t.usuario_id) : null;
    const access = t.usuario_username
      ? {
          tieneAcceso: true,
          usuarioId: Number.isFinite(usuarioId) ? usuarioId : null,
          usuario: t.usuario_username,
          estadoCuenta: t.usuario_estado || 'Activo',
          rol: t.rol_nombre || t.rol_codigo || null,
        }
      : { tieneAcceso: false };

    const assignments = (bundle.assignments || []).map((a) => {
      const conflictCurso = Boolean(a.conflict_curso);
      const conflictHorario = Boolean(a.conflict_horario);
      const conflictAula = Boolean(a.conflict_aula);
      const total = (conflictCurso ? 1 : 0) + (conflictHorario ? 1 : 0) + (conflictAula ? 1 : 0);

      return {
        id: a.asignacion_docente_id != null ? Number(a.asignacion_docente_id) : null,
        vigente: Boolean(a.vigente),
        cargaHorariaSemanal: a.carga_horaria != null ? a.carga_horaria : a.horas_plan ?? null,
        fechaAsignacion: fmtDate(a.fecha_asignacion),
        gestion: a.gestion_nombre ? `${a.gestion_nombre}${a.gestion_anio ? ` (${a.gestion_anio})` : ''}` : null,
        planHabilitado: a.gestion_plan_nombre,
        carrera: a.carrera_nombre,
        carreraColorHex: normalizeHex(a.carrera_color_hex),
        cursoColorHex: normalizeHex(a.curso_color_hex),
        paralelo: a.paralelo_nombre,
        turnoParalelo: a.paralelo_turno,
        periodoParalelo: a.paralelo_periodo_nombre,
        materia: a.materia_nombre,
        siglaMateria: a.materia_sigla,
        periodoMateriaPlan: a.asignatura_periodo_nombre,
        cursoCodigo: a.curso_codigo,
        horasPlanMateria: a.horas_plan,
        conflictos: {
          curso: conflictCurso,
          horario: conflictHorario,
          aula: conflictAula,
          total,
          hasConflictos: total > 0,
        },
      };
    });

    const courseSchedules = groupSchedules(bundle.schedules, assignments);

    return {
      profile,
      assignments,
      courseSchedules,
      access,
    };
  }
}
