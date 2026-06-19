/**
 * Mapea estado de cobranza, días de atraso y % de saldo a su clase de pill/dot de
 * color (mismo enfoque que `licenciaPills` del módulo de Asistencia: StatusPill +
 * clase CSS). CSS en
 * presentation/modules/finanzas/reportes/styles/cuentas-por-cobrar.css.
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

const ESTADO_LABEL = {
  AL_DIA: 'Al día',
  PROXIMA: 'Próxima',
  VENCIDA: 'Vencida',
  SIN_COMPROMISO: 'Sin compromiso',
};

/** Etiqueta legible del estado de cobranza. */
export const formatEstadoCobranza = (estado) => ESTADO_LABEL[estado] ?? 'Sin compromiso';

/** Clase del pill (StatusPill) que tiñe el estado bajo el nombre del estudiante. */
export const getEstadoCobranzaPillClass = (estado) =>
  `cobranza-pill cobranza-pill--${ESTADO_MOD[estado] ?? 'sin'}`;

/** Clase que tiñe el dot + etiqueta del estado bajo el nombre del estudiante. */
export const getEstadoCobranzaTextClass = (estado) =>
  `cobranza-estado--${ESTADO_MOD[estado] ?? 'sin'}`;

/**
 * Días de atraso → { label, pillClass }. Positivo = vencido (peligro), negativo =
 * faltan días (aviso), 0 = vence hoy (neutro fuerte), null = sin compromiso.
 */
export const getDiasAtrasoPill = (dias) => {
  if (dias == null) return { label: '—', pillClass: 'cobranza-pill cobranza-pill--sin' };
  const n = Number(dias) || 0;
  if (n > 0) return { label: `+${n} días`, pillClass: 'cobranza-pill cobranza-pill--vencida' };
  if (n < 0) return { label: `${n} días`, pillClass: 'cobranza-pill cobranza-pill--proxima' };
  return { label: 'Vence hoy', pillClass: 'cobranza-pill cobranza-pill--proxima' };
};

/**
 * % de saldo pendiente → clase de pill por severidad del saldo (0 = al día,
 * <50 = parcial, >=50 = alto). Solo la clase; la etiqueta la formatea la columna.
 */
export const getPorcentajeSaldoPillClass = (porcentaje) => {
  const n = Number(porcentaje) || 0;
  if (n <= 0) return 'cobranza-pill cobranza-pill--al-dia';
  if (n < 50) return 'cobranza-pill cobranza-pill--proxima';
  return 'cobranza-pill cobranza-pill--vencida';
};
