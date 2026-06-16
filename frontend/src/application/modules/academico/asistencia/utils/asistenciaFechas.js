/**
 * Formateo de fechas ISO (YYYY-MM-DD) para etiquetas de la planilla/calendario.
 * Sin dependencias de zona horaria (las fechas son días de clase, no instantes).
 */

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

const partes = (iso) => String(iso).split('-').map(Number);

/** Día de la semana UTC (0=Dom … 6=Sáb) de una fecha ISO. */
const diaSemana = (iso) => {
  const [y, m, d] = partes(iso);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

/** 'Lun' / 'Mar' … para la cabecera de columna. */
export const etiquetaDiaCorto = (iso) => DIAS_CORTOS[diaSemana(iso)] ?? '';

/** '12' (día del mes) para la cabecera de columna. */
export const numeroDia = (iso) => partes(iso)[2];

/** '12 jun' para el calendario / chips de semana. */
export const etiquetaDiaMes = (iso) => {
  const [, m, d] = partes(iso);
  return `${d} ${MESES_CORTOS[m - 1] ?? ''}`;
};

/** 'Lun 12 jun' completo. */
export const etiquetaFechaCompleta = (iso) => `${etiquetaDiaCorto(iso)} ${etiquetaDiaMes(iso)}`;
