/**
 * Mapper: horarios de capacitación (API → DTO de UI, módulo CAP).
 *
 * El backend entrega camelCase `{horarioId, nombre, dia, horaInicio, horaFin,
 * tipoHorario, ocupado, cursosEnUso}`; aquí se normaliza y se derivan la
 * etiqueta de presentación («SAB 08:00-12:00») y el orden semanal.
 */

import dayjs from 'dayjs';
import {
  buildHorarioEtiqueta,
  compararHorarios,
  horaADayjs,
  recortarHora,
} from '@application-capacitacion/utils/horarioCapacitacion';

const HORA_FORMATO = 'HH:mm';

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

/**
 * Mapea un horario del catálogo. El id puede venir como `horarioId` o `id`.
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapHorarioCapacitacion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const horarioId = raw.horarioId ?? raw.id;
  if (horarioId == null) return null;
  const dia = cleanText(raw.dia);
  const horaInicio = recortarHora(raw.horaInicio);
  const horaFin = recortarHora(raw.horaFin);
  return {
    id: Number(horarioId),
    horarioId: Number(horarioId),
    dia,
    horaInicio,
    horaFin,
    ocupado: raw.ocupado === true,
    cursosEnUso: Number(raw.cursosEnUso) || 0,
    etiqueta: buildHorarioEtiqueta(dia, horaInicio, horaFin) || `Horario ${horarioId}`,
  };
};

/** Mapea el catálogo, ordenado por día y hora. */
export const mapHorariosCapacitacionList = (rawList) =>
  Array.isArray(rawList)
    ? rawList.map(mapHorarioCapacitacion).filter(Boolean).sort(compararHorarios)
    : [];

/** Horario → valores iniciales del formulario (alta: vacío; edición: precarga). */
export const mapHorarioToFormValues = (horario) => ({
  dia: horario?.dia ?? undefined,
  horaInicio: horaADayjs(horario?.horaInicio),
  horaFin: horaADayjs(horario?.horaFin),
});

/**
 * Valores del formulario → payload de POST/PUT (`{dia, horaInicio, horaFin}`, horas
 * en HH:mm). El nombre/código interno lo genera el backend.
 */
export const mapFormValuesToHorarioPayload = (values = {}) => {
  return {
    dia: values.dia,
    horaInicio: dayjs(values.horaInicio).format(HORA_FORMATO),
    horaFin: dayjs(values.horaFin).format(HORA_FORMATO),
  };
};
