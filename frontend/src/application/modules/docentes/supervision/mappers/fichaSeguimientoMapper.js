/**
 * Mapper: fichas de seguimiento en clase (API → DTO de UI, módulo DOC ·
 * Supervisión docente).
 *
 * Fuente: vista 174 (`vista_supervision_fichas_listado`, listado + contexto
 * de cabecera) + entidad raíz `fichas_seguimiento_clase` (observaciones, solo
 * en el detalle). El backend YA entrega camelCase y el nombre de las personas
 * en orden institucional APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (armado en
 * la vista, `docenteNombre` / `evaluadorNombre`); este mapper solo agrega
 * formato de fecha y etiquetas compuestas para la UI.
 */

import dayjs from 'dayjs';

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

const formatFecha = (value) => {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.format('DD/MM/YYYY') : null;
};

/** Fila del listado (vista 174) o base de la ficha. Dataset: `fichasSeguimiento`. */
export const mapFichaSeguimiento = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  return {
    id: raw.id,
    fechaSeguimiento: raw.fechaSeguimiento ?? null,
    fechaLabel: formatFecha(raw.fechaSeguimiento),
    claseObservada: raw.claseObservada ?? 'PRESENCIAL',
    asignacionDocenteId: raw.asignacionDocenteId ?? null,
    docenteId: raw.docenteId ?? null,
    docenteNombre: cleanText(raw.docenteNombre),
    asignaturaNombre: cleanText(raw.asignaturaNombre),
    asignaturaSigla: cleanText(raw.asignaturaSigla),
    asignaturaLabel:
      [cleanText(raw.asignaturaSigla), cleanText(raw.asignaturaNombre)].filter(Boolean).join(' · ') ||
      null,
    carreraId: raw.carreraId ?? null,
    carreraCodigo: cleanText(raw.carreraCodigo),
    carreraNombre: cleanText(raw.carreraNombre),
    paraleloPeriodoNombre: cleanText(raw.paraleloPeriodoNombre),
    paraleloNombre: cleanText(raw.paraleloNombre),
    paraleloTurno: raw.paraleloTurno ?? null,
    cursoParaleloLabel:
      [cleanText(raw.paraleloPeriodoNombre), cleanText(raw.paraleloNombre)].filter(Boolean).join(' · ') ||
      null,
    carreraParaleloLabel:
      [cleanText(raw.carreraCodigo) || cleanText(raw.carreraNombre), cleanText(raw.paraleloNombre)]
        .filter(Boolean)
        .join(' · ') || null,
    gestionId: raw.gestionId ?? null,
    gestionNombre: cleanText(raw.gestionNombre),
    gestionAnio: raw.gestionAnio ?? null,
    supervisorId: raw.supervisorId ?? null,
    evaluadorNombre: cleanText(raw.evaluadorNombre),
    docsPresentados: Number(raw.docsPresentados ?? 0),
    docsCompletos: raw.docsCompletos ?? '0/4',
    estudiantesEnPlanilla: raw.estudiantesEnPlanilla ?? null,
    estudiantesAsistentes: raw.estudiantesAsistentes ?? null,
  };
};

/** Mapea el array del listado (dataKey `fichasSeguimiento`). */
export const mapFichasSeguimientoList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapFichaSeguimiento).filter(Boolean) : [];

/**
 * Ficha completa (S2/S3/S4, dataKey `fichaSeguimiento`): contexto de cabecera
 * (vista 174) + los 4 SI/NO de documentación + 2 cantidades + 9 TEXT de
 * observaciones (solo viven en la entidad raíz, no en el listado).
 */
export const mapFichaSeguimientoDetail = (raw) => {
  const base = mapFichaSeguimiento(raw);
  if (!base) return null;
  return {
    ...base,
    tieneCronogramaBimestral: raw.tieneCronogramaBimestral ?? null,
    tienePlanBimestral: raw.tienePlanBimestral ?? null,
    tieneRegistroAsistencia: raw.tieneRegistroAsistencia ?? null,
    tieneRegistroPedagogico: raw.tieneRegistroPedagogico ?? null,
    obsDocumentacion: cleanText(raw.obsDocumentacion),
    obsAvanceAsignatura: cleanText(raw.obsAvanceAsignatura),
    obsPresentacionTema: cleanText(raw.obsPresentacionTema),
    obsRecursos: cleanText(raw.obsRecursos),
    obsExposicion: cleanText(raw.obsExposicion),
    obsParticipacion: cleanText(raw.obsParticipacion),
    obsActividadesPracticas: cleanText(raw.obsActividadesPracticas),
    obsActividadesEvaluacion: cleanText(raw.obsActividadesEvaluacion),
    otrasObservaciones: cleanText(raw.otrasObservaciones),
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};

/**
 * Valores del formulario (AntD Form) → payload del backend (S3/S4). Los
 * booleanos de documentación se envían solo si el usuario los tocó
 * (`undefined` se omite: el switch sin valor no envía `false` por error).
 */
export const mapFormValuesToFichaPayload = (values = {}) => ({
  asignacionDocenteId:
    values.asignacionDocenteId != null ? Number(values.asignacionDocenteId) : null,
  fechaSeguimiento: values.fechaSeguimiento ? dayjs(values.fechaSeguimiento).format('YYYY-MM-DD') : null,
  tieneCronogramaBimestral: values.tieneCronogramaBimestral ?? null,
  tienePlanBimestral: values.tienePlanBimestral ?? null,
  tieneRegistroAsistencia: values.tieneRegistroAsistencia ?? null,
  tieneRegistroPedagogico: values.tieneRegistroPedagogico ?? null,
  obsDocumentacion: (values.obsDocumentacion || '').trim() || null,
  estudiantesEnPlanilla:
    values.estudiantesEnPlanilla != null ? Number(values.estudiantesEnPlanilla) : null,
  estudiantesAsistentes:
    values.estudiantesAsistentes != null ? Number(values.estudiantesAsistentes) : null,
  obsAvanceAsignatura: (values.obsAvanceAsignatura || '').trim() || null,
  obsPresentacionTema: (values.obsPresentacionTema || '').trim() || null,
  obsRecursos: (values.obsRecursos || '').trim() || null,
  obsExposicion: (values.obsExposicion || '').trim() || null,
  obsParticipacion: (values.obsParticipacion || '').trim() || null,
  obsActividadesPracticas: (values.obsActividadesPracticas || '').trim() || null,
  obsActividadesEvaluacion: (values.obsActividadesEvaluacion || '').trim() || null,
  otrasObservaciones: (values.otrasObservaciones || '').trim() || null,
});

/** Ficha → valores iniciales del formulario (edición S4). */
export const mapFichaToFormValues = (ficha) => ({
  asignacionDocenteId: ficha?.asignacionDocenteId ?? undefined,
  fechaSeguimiento: ficha?.fechaSeguimiento ? dayjs(ficha.fechaSeguimiento) : dayjs(),
  tieneCronogramaBimestral: ficha?.tieneCronogramaBimestral ?? undefined,
  tienePlanBimestral: ficha?.tienePlanBimestral ?? undefined,
  tieneRegistroAsistencia: ficha?.tieneRegistroAsistencia ?? undefined,
  tieneRegistroPedagogico: ficha?.tieneRegistroPedagogico ?? undefined,
  obsDocumentacion: ficha?.obsDocumentacion ?? '',
  estudiantesEnPlanilla: ficha?.estudiantesEnPlanilla ?? undefined,
  estudiantesAsistentes: ficha?.estudiantesAsistentes ?? undefined,
  obsAvanceAsignatura: ficha?.obsAvanceAsignatura ?? '',
  obsPresentacionTema: ficha?.obsPresentacionTema ?? '',
  obsRecursos: ficha?.obsRecursos ?? '',
  obsExposicion: ficha?.obsExposicion ?? '',
  obsParticipacion: ficha?.obsParticipacion ?? '',
  obsActividadesPracticas: ficha?.obsActividadesPracticas ?? '',
  obsActividadesEvaluacion: ficha?.obsActividadesEvaluacion ?? '',
  otrasObservaciones: ficha?.otrasObservaciones ?? '',
});
