/**
 * Mapper: participantes de capacitación (API → DTO de UI, módulo CAP).
 *
 * El backend ya entrega camelCase con `nombreCompleto`; se reconstruye igual
 * con `buildFullName` (orden canónico APELLIDO_PATERNO APELLIDO_MATERNO
 * NOMBRES) para mantener una sola convención, y se arma el CI completo.
 *
 * `cursoActualId`/`cursoActualTitulo`: inscripción vigente del participante
 * (si la tiene), expuesta por `GET /participantes` — `null` cuando no está
 * inscrito actualmente. Se usa en el selector de "Inscribir participante"
 * (sugeridos y resultados de búsqueda) para advertir de antemano si ya cursa
 * algo antes de decidir la nueva inscripción.
 */

import dayjs from 'dayjs';
import { buildFullName, buildCompleteCI } from '@application/utils/formatters';
import { mapInscripcionCapacitacion } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

/**
 * Mapea un participante del listado o de la ficha.
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapParticipante = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const expedicion = cleanText(raw.expedicion)?.toUpperCase() ?? null;

  return {
    id: raw.id,
    ci: cleanText(raw.ci),
    expedicion,
    ciCompleto: raw.ci ? buildCompleteCI(raw.ci, expedicion) : null,
    nombres: cleanText(raw.nombres),
    apellidoPaterno: cleanText(raw.apellidoPaterno),
    apellidoMaterno: cleanText(raw.apellidoMaterno),
    nombreCompleto: buildFullName(
      raw.nombres,
      raw.apellidoPaterno,
      raw.apellidoMaterno,
      raw.nombreCompleto || 'Sin nombre',
    ),
    celular: cleanText(raw.celular),
    email: cleanText(raw.email),
    cursoActualId: raw.cursoActualId ?? null,
    cursoActualTitulo: cleanText(raw.cursoActualTitulo),
    activo: raw.activo !== false && raw.activo !== 0,
    createdAt: raw.createdAt ?? null,
    registradoLabel: raw.createdAt ? dayjs(raw.createdAt).format('DD/MM/YYYY') : null,
  };
};

/**
 * Mapea la ficha del participante (dataKey `participante`): datos personales +
 * `inscripciones[]` (historial de capacitaciones, la más reciente primero).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapParticipanteDetail = (raw) => {
  const base = mapParticipante(raw);
  if (!base) return null;
  const inscripciones = (Array.isArray(raw.inscripciones) ? raw.inscripciones : [])
    .map(mapInscripcionCapacitacion)
    .filter(Boolean)
    .sort((a, b) => (b.fechaInscripcion || '').localeCompare(a.fechaInscripcion || '') || b.id - a.id);
  return { ...base, inscripciones };
};

/** Mapea el array del listado (dataKey `participantes`). */
export const mapParticipantesList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapParticipante).filter(Boolean) : [];

/**
 * Valores del formulario (modal de alta/edición) → payload del backend
 * (`create/updateParticipanteValidator`).
 * @param {Object} values
 * @returns {Object}
 */
export const mapFormValuesToParticipantePayload = (values = {}) => ({
  ci: (values.ci || '').trim(),
  expedicion: (values.expedicion || '').trim().toUpperCase() || null,
  nombres: (values.nombres || '').trim(),
  apellidoPaterno: (values.apellidoPaterno || '').trim() || null,
  apellidoMaterno: (values.apellidoMaterno || '').trim() || null,
  celular: (values.celular || '').trim(),
  email: (values.email || '').trim() || null,
});

/** Participante → valores iniciales del formulario del modal. */
export const mapParticipanteToFormValues = (participante) => ({
  ci: participante?.ci ?? '',
  expedicion: participante?.expedicion ?? undefined,
  nombres: participante?.nombres ?? '',
  apellidoPaterno: participante?.apellidoPaterno ?? '',
  apellidoMaterno: participante?.apellidoMaterno ?? '',
  celular: participante?.celular ?? '',
  email: participante?.email ?? '',
});
