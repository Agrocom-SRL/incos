/**
 * Formateo de fechas ISO (YYYY-MM-DD) para etiquetas de la planilla/calendario.
 * Sin dependencias de zona horaria (las fechas son días de clase, no instantes).
 */

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_CORTOS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
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

/** '12 jun 2026' para listados de licencias (rango y fecha de solicitud). */
export const etiquetaDiaMesAnio = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = partes(iso);
  if (!y || !m || !d) return String(iso);
  return `${d} ${MESES_CORTOS[m - 1] ?? ''} ${y}`;
};

/** 'Lun 12 jun 2026' completa con año (rango de fechas de una licencia). */
export const etiquetaRangoFechas = (desde, hasta) => {
  if (!desde) return '—';
  if (!hasta || hasta === desde) return etiquetaDiaMesAnio(desde);
  return `${etiquetaDiaMesAnio(desde)} – ${etiquetaDiaMesAnio(hasta)}`;
};

/** 'Lun 12 jun' completo. */
export const etiquetaFechaCompleta = (iso) => `${etiquetaDiaCorto(iso)} ${etiquetaDiaMes(iso)}`;

/**
 * Título de la semana para la cabecera de la grilla:
 *  - Mismo mes:   'Semana 15-20 de Junio'
 *  - Cruza mes:   'Semana 29 de Junio – 4 de Julio'
 */
export const tituloSemana = (desde, hasta) => {
  if (!desde || !hasta) return 'Semana';
  const [, mD, dD] = partes(desde);
  const [, mH, dH] = partes(hasta);
  if (mD === mH) {
    return `${dD}-${dH} de ${MESES[mD - 1] ?? ''}`;
  }
  return `${dD} de ${MESES[mD - 1] ?? ''} – ${dH} de ${MESES[mH - 1] ?? ''}`;
};
