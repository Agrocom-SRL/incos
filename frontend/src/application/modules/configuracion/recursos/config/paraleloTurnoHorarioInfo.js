/**
 * Franjas del catálogo `horarios` (seed 24) por turno — solo lectura informativa.
 * Alineado con turnoGridRange del módulo de armado.
 */
import { getTurnoGridRangeMinutes } from '@application-institucional/horarios/utils/turnoGridRange';
import { PARALELO_TURNOS } from './paraleloTurnoOptions';

const BLOQUE_MIN = 45;

const PARALELO_TURNOS_SET = new Set(
  PARALELO_TURNOS.map((t) =>
    t
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  )
);

const TURNO_DISPLAY = {
  MANANA: 'MAÑANA',
  TARDE: 'TARDE',
  NOCHE: 'NOCHE',
};

const formatHm = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const normalizeTurnoKey = (turno) =>
  String(turno || '')
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const buildSlotLabels = (startMinutes, count, stepMin = BLOQUE_MIN) => {
  const slots = [];
  for (let i = 0; i < count; i += 1) {
    const start = startMinutes + i * stepMin;
    const end = start + stepMin;
    slots.push(`${formatHm(start)}–${formatHm(end)}`);
  }
  return slots;
};

const TURNO_CATALOGO = {
  TARDE: {
    diasLabel: 'Lunes a viernes',
    bloquesPorDia: 6,
  },
  NOCHE: {
    diasLabel: 'Lunes a viernes',
    bloquesPorDia: 5,
  },
  MANANA: {
    diasLabel: 'Lunes a viernes',
    bloquesPorDia: null,
    sinCatalogo: true,
  },
};

/**
 * @param {string|null|undefined} turno
 * @returns {object|null}
 */
export const getParaleloTurnoHorarioInfo = (turno) => {
  const key = normalizeTurnoKey(turno);
  if (!key || !PARALELO_TURNOS_SET.has(key)) return null;

  const meta = TURNO_CATALOGO[key];
  const range = getTurnoGridRangeMinutes(key);
  const horaInicio = formatHm(range.start);
  const horaFin = formatHm(range.end);

  const slots =
    meta.bloquesPorDia != null
      ? buildSlotLabels(range.start, meta.bloquesPorDia)
      : [];

  return {
    turno: TURNO_DISPLAY[key] || key,
    diasLabel: meta.diasLabel,
    horaInicio,
    horaFin,
    bloquesPorDia: meta.bloquesPorDia,
    duracionBloqueMin: BLOQUE_MIN,
    slots,
    sinCatalogo: Boolean(meta.sinCatalogo),
    nota: meta.sinCatalogo
      ? 'Aún no hay bloques del turno MAÑANA en el catálogo institucional; rango referencial para planificación.'
      : null,
  };
};

/** Alias explícito para formulario/detalle (acepta MAÑANA con tilde). */
export const getParaleloTurnoHorarioInfoNormalized = getParaleloTurnoHorarioInfo;
