/**
 * Mapper: sesiones de refuerzo (API → DTO de UI, módulo TUT).
 *
 * Fuente: vista 161 (sesión + curso de la 130 + aula + resumen de
 * participantes). El backend entrega camelCase; se normaliza defensivamente.
 */

import dayjs from 'dayjs';
import { buildFullName } from '@application/utils/formatters';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

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

/** 'HH:MM:SS' → 'HH:MM'. */
const formatHora = (value) => cleanText(value)?.slice(0, 5) ?? null;

/** Fila del listado (vista 161) o base de la ficha. Dataset: `sesionesRefuerzo`. */
export const mapSesionRefuerzo = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const horaInicio = formatHora(raw.horaInicio);
  const horaFin = formatHora(raw.horaFin);

  return {
    id: raw.id,
    asignacionDocenteId: raw.asignacionDocenteId ?? null,
    fecha: raw.fecha ?? null,
    fechaLabel: formatFecha(raw.fecha),
    horaInicio,
    horaFin,
    horarioLabel: horaInicio && horaFin ? `${horaInicio} – ${horaFin}` : horaInicio,
    modalidad: raw.modalidad ?? 'PRESENCIAL',
    aulaId: raw.aulaId ?? null,
    aulaLabel:
      [cleanText(raw.aulaCodigo), cleanText(raw.aulaNombre)].filter(Boolean).join(' · ') || null,
    enlaceVirtual: cleanText(raw.enlaceVirtual),
    tema: cleanText(raw.tema),
    estado: raw.estado ?? 'PROGRAMADA',
    observaciones: cleanText(raw.observaciones),
    docenteNombre: cleanText(raw.docenteNombre),
    materiaNombre: cleanText(raw.materiaNombre),
    paraleloLabel: cleanText(raw.paraleloNombre ?? raw.paraleloCodigo),
    carreraNombre: cleanText(raw.carreraNombre),
    carreraCodigo: cleanText(raw.carreraCodigo),
    cursoLabel:
      [cleanText(raw.materiaNombre), cleanText(raw.paraleloNombre ?? raw.paraleloCodigo)]
        .filter(Boolean)
        .join(' · ') || null,
    participantesTotal: toNumber(raw.participantesTotal ?? raw.totalParticipantes),
    participantesAsistieron: toNumber(raw.participantesAsistieron ?? raw.asistieron),
    participantesMejorados: toNumber(raw.participantesMejorados ?? raw.mejorados),
  };
};

/** Mapea el array del listado (dataKey `sesionesRefuerzo`). */
export const mapSesionesRefuerzoList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapSesionRefuerzo).filter(Boolean) : [];

/** Fila de estudiante convocado a la sesión (raw dataKey `estudiantes`; se expone como `estudiantes` en la ficha mapeada). */
export const mapEstudianteSesion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const armado = cleanText(raw.estudianteNombre ?? raw.estudianteNombreCompleto);
  return {
    id: raw.id ?? null,
    matriculaMateriaId: raw.matriculaMateriaId ?? null,
    estudianteId: raw.estudianteId ?? null,
    estudianteNombre:
      armado ||
      buildFullName(raw.nombres, raw.apellidoPaterno, raw.apellidoMaterno) ||
      'Sin nombre',
    origen: raw.origen ?? 'RIESGO',
    asistio: raw.asistio === true || raw.asistio === 1 ? true : raw.asistio === false || raw.asistio === 0 ? false : null,
    progreso: raw.progreso ?? 'SIN_EVALUAR',
    observaciones: cleanText(raw.observaciones),
  };
};

/** Ficha completa (A5, dataKey `sesionRefuerzo`): sesión + estudiantes[]. */
export const mapSesionRefuerzoDetail = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const base = mapSesionRefuerzo(raw);
  if (!base) return null;
  return {
    ...base,
    estudiantes: Array.isArray(raw.estudiantes)
      ? raw.estudiantes.map(mapEstudianteSesion).filter(Boolean)
      : [],
  };
};

/**
 * Valores del formulario (AntD Form) → payload del backend (A6/A7).
 * `estudiantes` solo en alta (A6); la asistencia se registra por A9.
 */
export const mapFormValuesToSesionPayload = (values = {}, { incluirEstudiantes = true } = {}) => {
  const esVirtual = values.modalidad === 'VIRTUAL';
  return {
    asignacionDocenteId:
      values.asignacionDocenteId != null ? Number(values.asignacionDocenteId) : null,
    fecha: values.fecha ? dayjs(values.fecha).format('YYYY-MM-DD') : null,
    horaInicio: values.horaInicio ? dayjs(values.horaInicio).format('HH:mm') : null,
    horaFin: values.horaFin ? dayjs(values.horaFin).format('HH:mm') : null,
    modalidad: values.modalidad ?? 'PRESENCIAL',
    aulaId: esVirtual ? null : values.aulaId != null ? Number(values.aulaId) : null,
    enlaceVirtual: esVirtual ? (values.enlaceVirtual || '').trim() || null : null,
    tema: (values.tema || '').trim() || null,
    observaciones: (values.observaciones || '').trim() || null,
    ...(incluirEstudiantes
      ? {
          estudiantes: Array.isArray(values.estudiantes)
            ? values.estudiantes.map((matriculaMateriaId) => ({
                matriculaMateriaId: Number(matriculaMateriaId),
                origen: 'RIESGO',
              }))
            : [],
        }
      : {}),
  };
};

/** Ficha → valores iniciales del formulario (edición A7). */
export const mapSesionToFormValues = (sesion) => ({
  asignacionDocenteId: sesion?.asignacionDocenteId ?? undefined,
  fecha: sesion?.fecha ? dayjs(sesion.fecha) : dayjs(),
  horaInicio: sesion?.horaInicio ? dayjs(sesion.horaInicio, 'HH:mm') : undefined,
  horaFin: sesion?.horaFin ? dayjs(sesion.horaFin, 'HH:mm') : undefined,
  modalidad: sesion?.modalidad ?? 'PRESENCIAL',
  aulaId: sesion?.aulaId ?? undefined,
  enlaceVirtual: sesion?.enlaceVirtual ?? '',
  tema: sesion?.tema ?? '',
  observaciones: sesion?.observaciones ?? '',
  estudiantes: sesion?.estudiantes?.map((p) => p.matriculaMateriaId).filter(Boolean) ?? [],
});
