import { DIA_SEMANA_A_INDICE } from '../../domain/constants/asistencia.constants.js';

/**
 * Utilidades de calendario de asistencia. La EXPANSIÓN "día-de-semana del horario →
 * fechas reales del rango del bimestre" es LÓGICA DE APP (no SQL): se itera el rango
 * y se conservan las fechas cuyo día de semana esté en el set del horario.
 */

/** Normaliza un Date / 'YYYY-MM-DD' a 'YYYY-MM-DD' (UTC, sin desfase de zona). */
export function toISODate(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** getDay() en UTC para una fecha 'YYYY-MM-DD' (0=DOMINGO … 6=SABADO). */
function indiceDiaSemana(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.getUTCDay();
}

/** Suma `n` días a una fecha 'YYYY-MM-DD' y devuelve 'YYYY-MM-DD'. */
function sumarDias(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return toISODate(d);
}

/**
 * Expande un rango [desde, hasta] a las fechas cuyo día de semana esté en `diasSet`.
 *
 * @param {string} desde 'YYYY-MM-DD'
 * @param {string} hasta 'YYYY-MM-DD'
 * @param {Set<number>} diasSet índices getDay() de los días con clase
 * @returns {string[]} fechas 'YYYY-MM-DD' que tocan clase
 */
export function expandirFechasClase(desde, hasta, diasSet) {
  const inicio = toISODate(desde);
  const fin = toISODate(hasta);
  if (!inicio || !fin || inicio > fin) return [];

  const fechas = [];
  let cursor = inicio;
  let guard = 0;
  while (cursor <= fin && guard < 1000) {
    if (diasSet.has(indiceDiaSemana(cursor))) {
      fechas.push(cursor);
    }
    cursor = sumarDias(cursor, 1);
    guard += 1;
  }
  return fechas;
}

/**
 * Construye el set de índices de día-de-semana (getDay) a partir de los bloques de
 * horario de la vista 128 (campo `dia` ENUM LUNES..DOMINGO).
 *
 * @param {Array<{ dia: string }>} bloquesHorario
 * @returns {Set<number>}
 */
export function setDiasDesdeHorario(bloquesHorario = []) {
  const set = new Set();
  for (const b of bloquesHorario) {
    const idx = DIA_SEMANA_A_INDICE[String(b?.dia ?? '').toUpperCase()];
    if (idx != null) set.add(idx);
  }
  return set;
}

/** Hoy en 'YYYY-MM-DD' (UTC). */
export function hoyISO() {
  return toISODate(new Date());
}

/**
 * Expande filas de feriados (rango fecha_inicio..fecha_fin) a un Set de fechas
 * 'YYYY-MM-DD'. Usado para marcar días neutros del calendario.
 *
 * @param {Array<{ fecha_inicio: string, fecha_fin: string|null }>} feriados
 * @returns {Set<string>}
 */
export function expandirFeriados(feriados = []) {
  const set = new Set();
  for (const f of feriados) {
    const ini = toISODate(f.fecha_inicio);
    const fin = toISODate(f.fecha_fin) ?? ini;
    if (ini) {
      let cursor = ini;
      let guard = 0;
      while (cursor <= fin && guard < 400) {
        set.add(cursor);
        cursor = sumarDias(cursor, 1);
        guard += 1;
      }
    }
  }
  return set;
}
