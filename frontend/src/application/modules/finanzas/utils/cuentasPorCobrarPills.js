/**
 * Mapea estado de cobranza, días de atraso y % de saldo a su clase de pill/dot de
 * color. Lenguaje de PLANILLA oficial (kit `fin-planilla`): el estado se pinta
 * como DOT de color (`fin-dot--ok/--prox/--venc`) y el saldo como banda teñida
 * en la celda (`fin-banda--ok/--warn/--err`). CSS del dot/banda en el kit
 * `presentation/modules/finanzas/styles/finanzas-planilla.css`; ajustes locales
 * en `cuentas-por-cobrar.css`.
 *
 * Estados de cobranza (del backend):
 *   AL_DIA → al-dia · PROXIMA → proxima · VENCIDA → vencida · SIN_COMPROMISO → sin
 */

const ESTADO_MOD = {
  AL_DIA: 'al-dia',
  PROXIMA: 'proxima',
  VENCIDA: 'vencida',
  SIN_COMPROMISO: 'sin',
};

/** Estado de cobranza → clase de DOT del kit de planilla (`fin-dot--*`). */
const ESTADO_DOT = {
  AL_DIA: 'fin-dot--ok',
  PROXIMA: 'fin-dot--prox',
  VENCIDA: 'fin-dot--venc',
  SIN_COMPROMISO: '',
};

const ESTADO_LABEL = {
  AL_DIA: 'Al día',
  PROXIMA: 'Próxima',
  VENCIDA: 'Vencida',
  SIN_COMPROMISO: 'Sin compromiso',
};

/** Etiqueta legible del estado de cobranza. */
export const formatEstadoCobranza = (estado) => ESTADO_LABEL[estado] ?? 'Sin compromiso';

/** Estado de cobranza → clase del DOT de color del kit (`fin-dot--*`). */
export const getEstadoDotClass = (estado) => ESTADO_DOT[estado] ?? '';

/**
 * Días de atraso → etiqueta legible. Positivo = vencido (días de atraso),
 * negativo = faltan días al vencimiento, 0 = vence hoy, null = sin compromiso.
 * El color de severidad lo lleva el DOT de estado de la fila, no esta celda.
 */
export const getDiasAtrasoLabel = (dias) => {
  if (dias == null) return '—';
  const n = Number(dias) || 0;
  if (n > 0) return `+${n}`;
  if (n < 0) return `${n}`;
  return 'Hoy';
};

/**
 * Saldo pendiente → clase de BANDA teñida del kit (`fin-banda--*`) para la celda
 * de saldo. 0 = al día (verde), parcial = aviso (ámbar), alto = peligro (rojo).
 */
export const getSaldoBandaClass = (saldo) => {
  const n = Number(saldo) || 0;
  if (n <= 0) return 'fin-banda--ok';
  return 'fin-banda--err';
};
