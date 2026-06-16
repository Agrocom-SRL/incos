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

/** Etiqueta legible por día de semana (ENUM `horarios.dia`). */
const DIA_SEMANA_LABEL = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

/** Orden de la semana (Lunes primero) para presentar el horario. */
const DIA_SEMANA_ORDEN = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
  DOMINGO: 7,
};

/** 'HH:MM:SS' / Date → 'HH:MM'. */
function toHHMM(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }
  return String(value).slice(0, 5);
}

/**
 * Resume el horario semanal del curso AGRUPADO por día: cada día aparece una sola vez
 * (aunque tenga varios bloques) con la lista de sus rangos horarios ordenados, y el
 * rango consolidado (primera hora de inicio – última hora de fin).
 *
 * @param {Array<{ dia: string, hora_inicio: string, hora_fin: string }>} bloquesHorario
 * @returns {Array<{ dia: string, diaLabel: string, bloques: Array<{ inicio: string, fin: string }>, rango: string }>}
 */
export function resumirHorarioSemanal(bloquesHorario = []) {
  const porDia = new Map();
  for (const b of bloquesHorario) {
    const dia = String(b?.dia ?? '').toUpperCase();
    const inicio = toHHMM(b?.hora_inicio);
    const fin = toHHMM(b?.hora_fin);
    if (DIA_SEMANA_ORDEN[dia] && inicio && fin) {
      if (!porDia.has(dia)) porDia.set(dia, []);
      porDia.get(dia).push({ inicio, fin });
    }
  }

  return [...porDia.entries()]
    .map(([dia, bloques]) => {
      const ordenados = bloques.sort((a, b) => a.inicio.localeCompare(b.inicio));
      return {
        dia,
        diaLabel: DIA_SEMANA_LABEL[dia] ?? dia,
        bloques: ordenados,
        // Rango consolidado: útil cuando los bloques son contiguos (mismo día).
        rango: `${ordenados[0].inicio} – ${ordenados[ordenados.length - 1].fin}`,
      };
    })
    .sort((a, b) => DIA_SEMANA_ORDEN[a.dia] - DIA_SEMANA_ORDEN[b.dia]);
}

/** Hoy en 'YYYY-MM-DD' (UTC). */
export function hoyISO() {
  return toISODate(new Date());
}

/**
 * Resuelve el número de bimestre activo (1-4) de la gestión a partir de sus periodos.
 * Prioridad: bimestre abierto del calendario → el que contiene hoy → último ya iniciado →
 * primero de la gestión. Devuelve null si no hay periodos.
 *
 * @param {Array<{ numero_orden:number, estado_calendario?:string, fecha_inicio:string, fecha_fin:string }>} periodos
 * @param {string} [hoy] 'YYYY-MM-DD'
 * @returns {number|null}
 */
export function resolverBimestreActivo(periodos = [], hoy = hoyISO()) {
  const lista = periodos ?? [];
  const abierto = lista.find((p) => p.estado_calendario === 'abierto');
  if (abierto) return Number(abierto.numero_orden);

  const vigente = lista.find(
    (p) => toISODate(p.fecha_inicio) <= hoy && hoy <= toISODate(p.fecha_fin),
  );
  if (vigente) return Number(vigente.numero_orden);

  const iniciados = lista
    .filter((p) => toISODate(p.fecha_inicio) <= hoy)
    .sort((a, b) => Number(b.numero_orden) - Number(a.numero_orden));
  if (iniciados.length > 0) return Number(iniciados[0].numero_orden);

  return lista.length > 0 ? Number(lista[0].numero_orden) : null;
}

/**
 * Semana (lun–sáb) que contiene `fecha`, recortada al rango del bimestre.
 * Espejo de `asistenciaSemanas.semanaDeFecha` del frontend.
 *
 * @param {string} fecha 'YYYY-MM-DD'
 * @param {{ desde:string, hasta:string }} rango límites del bimestre
 * @returns {{ desde:string, hasta:string }}
 */
export function semanaDeFecha(fecha, rango) {
  const f = toISODate(fecha);
  const dow = indiceDiaSemana(f); // 0=domingo … 6=sábado
  const offsetLunes = dow === 0 ? 6 : dow - 1;
  const lunes = sumarDias(f, -offsetLunes);
  const sabado = sumarDias(lunes, 5);
  const acotar = (iso) => {
    if (iso < rango.desde) return rango.desde;
    if (iso > rango.hasta) return rango.hasta;
    return iso;
  };
  return { desde: acotar(lunes), hasta: acotar(sabado) };
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
