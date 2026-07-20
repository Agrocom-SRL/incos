/**
 * Mapper: cursos de capacitación (API → DTO de UI, módulo CAP).
 *
 * El backend ya entrega camelCase (CursoCapacitacionMapper de la vista 155);
 * aquí solo se normaliza defensivamente y se derivan etiquetas de presentación
 * (fechas DD/MM/YYYY, líneas de horarios, cupo).
 */

import dayjs from 'dayjs';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

/** Fecha ISO → DD/MM/YYYY (o null si no es válida). */
const formatFecha = (value) => {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.format('DD/MM/YYYY') : null;
};

/**
 * Mapea una fila del listado (vista 155) o la ficha base del curso.
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapCursoCapacitacion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const fechaInicioLabel = formatFecha(raw.fechaInicio);
  const fechaFinLabel = formatFecha(raw.fechaFin);
  const horariosDetalle = cleanText(raw.horariosDetalle);

  return {
    id: raw.id,
    titulo: cleanText(raw.titulo) || 'Sin título',
    descripcion: cleanText(raw.descripcion),
    costo: toNumber(raw.costo),
    cupoMaximo: raw.cupoMaximo != null ? toNumber(raw.cupoMaximo) : null,
    fechaInicio: raw.fechaInicio ?? null,
    fechaFin: raw.fechaFin ?? null,
    fechaInicioLabel,
    fechaFinLabel,
    fechasLabel:
      fechaInicioLabel && fechaFinLabel ? `${fechaInicioLabel} – ${fechaFinLabel}` : fechaInicioLabel,
    estado: raw.estado ?? null,
    aulaId: raw.aulaId ?? null,
    aulaCodigo: cleanText(raw.aulaCodigo),
    aulaNombre: cleanText(raw.aulaNombre),
    aulaLabel:
      [cleanText(raw.aulaCodigo), cleanText(raw.aulaNombre)].filter(Boolean).join(' · ') || null,
    inscritosCount: toNumber(raw.inscritosCount),
    cupoDisponible: toNumber(raw.cupoDisponible),
    horariosCount: toNumber(raw.horariosCount),
    horariosDetalle,
    // "LUN 15:00-17:00 · MIE 19:00-21:00" → una línea por bloque (InfoLinesCell).
    horariosLineas: horariosDetalle ? horariosDetalle.split(' · ').filter(Boolean) : [],
    activo: raw.activo !== false && raw.activo !== 0,
    createdAt: raw.createdAt ?? null,
  };
};

/** Mapea el array del listado (dataKey `cursosCapacitacion`). */
export const mapCursosCapacitacionList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapCursoCapacitacion).filter(Boolean) : [];

/**
 * Mapea un bloque horario de la ficha (vista 154).
 * @param {Object} raw
 * @returns {Object|null}
 */
const mapBloqueHorario = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    capacitacionHorarioId: raw.capacitacionHorarioId ?? null,
    horarioId: raw.horarioId ?? null,
    ordenSecuencia: raw.ordenSecuencia ?? null,
    dia: cleanText(raw.dia),
    diaAbreviado: cleanText(raw.diaAbreviado),
    diaOrden: raw.diaOrden != null ? toNumber(raw.diaOrden) : null,
    horaInicio: cleanText(raw.horaInicio),
    horaFin: cleanText(raw.horaFin),
    bloqueEtiqueta: cleanText(raw.bloqueEtiqueta),
    aulaLabel:
      [cleanText(raw.aulaCodigo), cleanText(raw.aulaNombre)].filter(Boolean).join(' · ') || null,
  };
};

/**
 * Mapea la ficha completa (dataKey `cursoCapacitacion`): curso + horarios[] +
 * horarioIds[] (para precargar el formulario de edición).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapCursoCapacitacionDetail = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const base = mapCursoCapacitacion(raw);
  if (!base) return null;
  return {
    ...base,
    horarios: Array.isArray(raw.horarios) ? raw.horarios.map(mapBloqueHorario).filter(Boolean) : [],
    horarioIds: Array.isArray(raw.horarioIds) ? raw.horarioIds.map(Number) : [],
  };
};

/**
 * Bloque de disponibilidad de horario (GET /cursos-capacitacion/horarios-disponibles).
 * `turno` (MAÑANA/TARDE/NOCHE) es el real de la vista de `horarios`, no un
 * catálogo local; `ocupado` deshabilita el bloque en el picker sin ocultarlo.
 * @param {Object} raw
 * @returns {Object|null}
 */
const mapHorarioDisponible = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.horarioId == null) return null;
  const dia = cleanText(raw.dia);
  const horaInicio = cleanText(raw.horaInicio)?.slice(0, 5) ?? null;
  const horaFin = cleanText(raw.horaFin)?.slice(0, 5) ?? null;
  return {
    horarioId: Number(raw.horarioId),
    dia,
    horaInicio,
    horaFin,
    turno: cleanText(raw.turno),
    numeroBloque: raw.numeroBloque != null ? toNumber(raw.numeroBloque) : null,
    ocupado: raw.ocupado === true,
    bloqueLabel:
      [dia, horaInicio && horaFin ? `${horaInicio}-${horaFin}` : null].filter(Boolean).join(' ') ||
      `Bloque ${raw.horarioId}`,
  };
};

/** Mapea la lista de disponibilidad (dataKey `horarios`). */
export const mapHorariosDisponibles = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapHorarioDisponible).filter(Boolean) : [];

/**
 * Valores del formulario (AntD Form) → payload del backend
 * (`createCursoCapacitacionValidator` / `updateCursoCapacitacionValidator`).
 * @param {Object} values
 * @returns {Object}
 */
export const mapFormValuesToCursoPayload = (values = {}) => ({
  titulo: (values.titulo || '').trim(),
  descripcion: (values.descripcion || '').trim() || null,
  costo: values.costo != null ? Number(values.costo) : 0,
  cupoMaximo: values.cupoMaximo != null ? Number(values.cupoMaximo) : undefined,
  aulaId: values.aulaId != null ? Number(values.aulaId) : null,
  fechaInicio: values.fechaInicio ? dayjs(values.fechaInicio).format('YYYY-MM-DD') : undefined,
  fechaFin: values.fechaFin ? dayjs(values.fechaFin).format('YYYY-MM-DD') : undefined,
  estado: values.estado || undefined,
  horarioIds: Array.isArray(values.horarioIds) ? values.horarioIds.map(Number) : [],
});

/**
 * Ficha → valores iniciales del formulario (alta y edición).
 *
 * `fechaInicio`/`fechaFin` en alta (`curso` null) se precargan con hoy/mañana
 * como valor REAL del `Form` (no solo visual): `FieldDatePicker` muestra hoy
 * como `defaultValue` no controlado cuando el campo no tiene `minAge` ni
 * `defaultValue` propio (`useFieldDatePicker.dayjsDefaultValue`), pero eso
 * nunca queda registrado en el store hasta que el usuario interactúa — por
 * eso `validateFields()` seguía marcando el campo como vacío aunque se viera
 * "20-07-2026". Setear el valor aquí (vía `form.setFieldsValue` en el hook de
 * pantalla) lo deja realmente cargado.
 */
export const mapCursoToFormValues = (curso) => ({
  titulo: curso?.titulo ?? '',
  descripcion: curso?.descripcion ?? '',
  costo: curso?.costo ?? 0,
  cupoMaximo: curso?.cupoMaximo ?? 30,
  aulaId: curso?.aulaId ?? undefined,
  fechaInicio: curso?.fechaInicio ? dayjs(curso.fechaInicio) : dayjs(),
  fechaFin: curso?.fechaFin ? dayjs(curso.fechaFin) : dayjs().add(1, 'day'),
  estado: curso?.estado ?? 'PROPUESTO',
  horarioIds: Array.isArray(curso?.horarioIds) ? curso.horarioIds : [],
});
