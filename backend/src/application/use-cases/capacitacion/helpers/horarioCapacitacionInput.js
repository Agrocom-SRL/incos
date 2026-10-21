import { ValidationError } from '../../../../domain/errors/AppError.js';
import { DIAS_SEMANA_VALUES, TIPOS_HORARIO } from '../../../../domain/constants/cursos.constants.js';

const FORMATO_HORA = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

/** Normaliza HH:MM o HH:MM:SS a HH:MM:SS o lanza ValidationError. */
function parseHora(valor, nombre) {
  const match = typeof valor === 'string' ? FORMATO_HORA.exec(valor.trim()) : null;
  if (!match) throw new ValidationError(`${nombre} debe tener formato HH:MM`);
  return `${match[1]}:${match[2]}:${match[3] ?? '00'}`;
}

/**
 * Código interno del horario: combinación de día y horas (ej. `CAP-SABADO-0800-1200`).
 * Identifica el horario sin pedir nombre al usuario y no se muestra en la interfaz
 * (la pantalla usa la etiqueta «SAB 08:00-12:00»).
 */
export function codigoHorario({ dia, horaInicio, horaFin }) {
  const compacta = (hora) => hora.slice(0, 5).replace(':', '');
  return `CAP-${dia}-${compacta(horaInicio)}-${compacta(horaFin)}`;
}

/**
 * Valida y normaliza los datos de un horario de capacitación (día y horas). El nombre
 * se genera siempre a partir de ellos (`codigoHorario`); cualquier `nombre` recibido se ignora.
 *
 * @param {Object} body - { dia, horaInicio, horaFin }
 * @returns {{dia: string, horaInicio: string, horaFin: string, nombre: string}}
 */
export function parseDatosHorario(body = {}) {
  const dia = String(body.dia ?? '').trim().toUpperCase();
  if (!DIAS_SEMANA_VALUES.includes(dia)) {
    throw new ValidationError(`dia debe ser uno de: ${DIAS_SEMANA_VALUES.join(', ')}`);
  }
  const horaInicio = parseHora(body.horaInicio, 'horaInicio');
  const horaFin = parseHora(body.horaFin, 'horaFin');
  if (horaFin <= horaInicio) {
    throw new ValidationError('horaFin debe ser posterior a horaInicio');
  }
  return { dia, horaInicio, horaFin, nombre: codigoHorario({ dia, horaInicio, horaFin }) };
}

/** Criterio de búsqueda del horario exacto (mismo día y horas) dentro del catálogo CAPACITACION. */
export function criterioHorarioExacto({ dia, horaInicio, horaFin }) {
  return {
    day: dia,
    startTime: horaInicio,
    endTime: horaFin,
    scheduleType: TIPOS_HORARIO.CAPACITACION,
  };
}

/** ¿La entidad Schedule pertenece al catálogo de capacitación? */
export function esHorarioCapacitacion(horario) {
  return horario?.scheduleType === TIPOS_HORARIO.CAPACITACION;
}

/** Convierte una entidad Schedule a la fila camelCase que consume el mapper del catálogo. */
export function horarioEntityToFila(horario, cursosEnUso = 0) {
  return {
    horarioId: horario.id,
    nombre: horario.name,
    dia: horario.day,
    horaInicio: horario.startTime,
    horaFin: horario.endTime,
    tipoHorario: horario.scheduleType,
    ocupado: 0,
    cursosEnUso,
  };
}
