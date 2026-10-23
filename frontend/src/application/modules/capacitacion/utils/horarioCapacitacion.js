import dayjs from 'dayjs';

/**
 * Utilidades de horarios de capacitación (día + rango de horas).
 *
 * El catálogo vive en el backend (`GET /cursos-capacitacion/horarios`); aquí
 * solo se arma la etiqueta de presentación («SAB 08:00-12:00»), el orden
 * semanal y el turno derivado de la hora (para colorear el tag). Sin IDs
 * hardcodeados.
 */

/** Orden semanal y abreviatura por día (clave sin tildes, en mayúsculas). */
const DIAS = {
  LUNES: { abbr: 'LUN', orden: 1 },
  MARTES: { abbr: 'MAR', orden: 2 },
  MIERCOLES: { abbr: 'MIE', orden: 3 },
  JUEVES: { abbr: 'JUE', orden: 4 },
  VIERNES: { abbr: 'VIE', orden: 5 },
  SABADO: { abbr: 'SAB', orden: 6 },
  DOMINGO: { abbr: 'DOM', orden: 7 },
};

/** Color de pill por día (variantes `cfg-materia-pill--*` existentes): cada día se distingue de un vistazo. */
const DIA_PILL = {
  LUNES: 'primary',
  MARTES: 'info',
  MIERCOLES: 'success',
  JUEVES: 'warning',
  VIERNES: 'purple',
  SABADO: 'accent',
  DOMINGO: 'danger',
};

/** Clase de pill para un día (acepta nombre completo o abreviado). */
export const claseDiaHorario = (dia) => {
  const key = normalizarDia(dia);
  const nombre = DIA_PILL[key] ? key : Object.keys(DIAS).find((k) => DIAS[k].abbr === key.slice(0, 3));
  return `cfg-materia-pill cfg-materia-pill--${DIA_PILL[nombre] ?? 'default'}`;
};

/** Etiquetas del select de día al crear un horario (valor = ENUM que valida el backend). */
const DIA_LABELS = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

export const DIA_HORARIO_OPTIONS = Object.keys(DIAS).map((value) => ({
  value,
  label: DIA_LABELS[value],
}));

const normalizarDia = (dia) =>
  String(dia ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toUpperCase();

/** 'HH:mm:ss' | 'HH:mm' → 'HH:mm' (null si no hay valor). */
export const recortarHora = (hora) => {
  if (hora == null || hora === '') return null;
  return String(hora).slice(0, 5);
};

/**
 * 'HH:mm' | 'HH:mm:ss' → dayjs de hoy a esa hora (valor de un `TimePicker`);
 * `undefined` si no hay hora. Evita depender del plugin customParseFormat.
 */
export const horaADayjs = (hora) => {
  const texto = recortarHora(hora);
  if (!texto) return undefined;
  const [h, m] = texto.split(':').map(Number);
  return dayjs().hour(h).minute(m || 0).second(0).millisecond(0);
};

/** Abreviatura del día (acepta nombre completo o ya abreviado). */
export const abreviarDia = (dia) => {
  const key = normalizarDia(dia);
  if (!key) return '';
  const porNombre = DIAS[key];
  if (porNombre) return porNombre.abbr;
  return key.slice(0, 3);
};

/** Posición del día en la semana (para ordenar); desconocido va al final. */
export const ordenDia = (dia) => {
  const key = normalizarDia(dia);
  const porNombre = DIAS[key];
  if (porNombre) return porNombre.orden;
  const porAbbr = Object.values(DIAS).find((d) => d.abbr === key.slice(0, 3));
  return porAbbr?.orden ?? 99;
};

/** Nombre completo del día («Miércoles»); desconocido devuelve el texto tal cual. */
const nombreDia = (dia) => {
  const key = normalizarDia(dia);
  const porAbbr = Object.keys(DIAS).find((nombre) => DIAS[nombre].abbr === key.slice(0, 3));
  return DIA_LABELS[key] ?? DIA_LABELS[porAbbr] ?? String(dia ?? '').trim();
};

/** Une días: `A y B` con dos, `A, B, C` con más. */
const unirDias = (dias) => (dias.length === 2 ? dias.join(' y ') : dias.join(', '));

/**
 * Horarios de un grupo como bloques `{ dias, horas }` para mostrar días y horas por
 * separado: los días que comparten hora se agrupan («Martes y Jueves» · «19:00 - 21:00»).
 * Bloques en orden de aparición; días en orden semanal.
 * @param {Array<{dia: string, horaInicio?: string, horaFin?: string}>} horarios
 * @returns {Array<{dias: string, horas: string}>}
 */
export const bloquesHorarios = (horarios = []) => {
  const porHoras = new Map();
  [...horarios]
    .sort((a, b) => ordenDia(a.dia) - ordenDia(b.dia))
    .forEach((h) => {
      const ini = recortarHora(h.horaInicio);
      const fin = recortarHora(h.horaFin);
      const horas = ini && fin ? `${ini} - ${fin}` : '';
      porHoras.set(horas, [...(porHoras.get(horas) ?? []), nombreDia(h.dia)]);
    });
  return [...porHoras].map(([horas, dias]) => ({ dias: unirDias(dias), horas }));
};

/**
 * Bloques `{ dias, horas }` a partir de etiquetas «LUN 19:00-21:00» (listados que solo
 * traen el texto de la vista). Misma agrupación que `bloquesHorarios`; una etiqueta que no
 * respeta el formato se ignora.
 * @param {string[]} etiquetas
 * @returns {Array<{dias: string, horas: string}>}
 */
export const bloquesDesdeEtiquetas = (etiquetas = []) =>
  bloquesHorarios(
    etiquetas
      .map((etiqueta) => /^(\S+)\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(String(etiqueta).trim()))
      .filter(Boolean)
      .map(([, dia, horaInicio, horaFin]) => ({ dia, horaInicio, horaFin })),
  );

/** «SAB 08:00-12:00»; sin horas devuelve solo el día. */
export const buildHorarioEtiqueta = (dia, horaInicio, horaFin) => {
  const ini = recortarHora(horaInicio);
  const fin = recortarHora(horaFin);
  return [abreviarDia(dia), ini && fin ? `${ini}-${fin}` : null].filter(Boolean).join(' ');
};

/**
 * Turno derivado de la hora de inicio (< 12 MAÑANA, < 18 TARDE, resto NOCHE):
 * mismo vocabulario que el resolver de pills de turno de Paralelos.
 */
export const turnoDeHora = (horaInicio) => {
  const hora = Number(String(horaInicio ?? '').slice(0, 2));
  if (!Number.isFinite(hora) || horaInicio == null || horaInicio === '') return null;
  if (hora < 12) return 'MAÑANA';
  if (hora < 18) return 'TARDE';
  return 'NOCHE';
};

/** Comparador semanal: día y luego hora de inicio. */
export const compararHorarios = (a, b) =>
  ordenDia(a.dia) - ordenDia(b.dia) ||
  String(a.horaInicio ?? '').localeCompare(String(b.horaInicio ?? ''));

/**
 * Valida los valores del creador de horario (día + horas) antes de llamar al
 * backend. Devuelve el mensaje de error o `null` si es válido. `horaInicio` /
 * `horaFin` aceptan dayjs o 'HH:mm'.
 */
export const validarHorarioNuevo = ({ dia, horaInicio, horaFin } = {}) => {
  if (!dia) return 'Seleccione el día';
  if (!horaInicio || !horaFin) return 'Indique la hora de inicio y de fin';
  const aMinutos = (valor) => {
    if (typeof valor === 'string') {
      const [h, m] = valor.split(':').map(Number);
      return h * 60 + (m || 0);
    }
    return valor.hour() * 60 + valor.minute();
  };
  if (aMinutos(horaFin) <= aMinutos(horaInicio)) {
    return 'La hora de fin debe ser posterior a la de inicio';
  }
  return null;
};

/**
 * Opciones del select de horarios del formulario de curso + turno por id.
 *
 * Parte del catálogo (`GET /cursos-capacitacion/horarios`) y agrega los
 * horarios ya asignados al curso que no estén en él (p. ej. bloques legados),
 * para que la edición nunca pierda una selección existente.
 *
 * @param {Array} catalogo - horarios mapeados del catálogo
 * @param {Array} [horariosCurso] - `horarios[]` del detalle del curso
 * @returns {{options: Array<{value: number, label: string}>, turnoById: Object, diaById: Object}}
 */
export const buildHorarioOptions = (catalogo = [], horariosCurso = []) => {
  const porId = new Map();
  for (const h of catalogo) {
    porId.set(Number(h.horarioId), {
      horarioId: Number(h.horarioId),
      dia: h.dia,
      horaInicio: h.horaInicio,
      etiqueta: h.etiqueta,
    });
  }
  for (const h of horariosCurso) {
    const id = Number(h.horarioId);
    if (!Number.isFinite(id) || porId.has(id)) continue;
    porId.set(id, {
      horarioId: id,
      dia: h.dia,
      horaInicio: h.horaInicio,
      etiqueta: h.etiqueta || buildHorarioEtiqueta(h.dia, h.horaInicio, h.horaFin),
    });
  }
  const ordenados = [...porId.values()].sort(compararHorarios);
  return {
    options: ordenados.map((h) => ({ value: h.horarioId, label: h.etiqueta })),
    turnoById: Object.fromEntries(ordenados.map((h) => [h.horarioId, turnoDeHora(h.horaInicio)])),
    diaById: Object.fromEntries(ordenados.map((h) => [h.horarioId, h.dia])),
  };
};
