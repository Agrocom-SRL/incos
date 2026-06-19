/**
 * Mapea estado del aporte, saldo y % cubierto a su clase de pill/dot de color
 * (mismo enfoque que `licenciaPills` de Asistencia y `cuentasPorCobrarPills`:
 * StatusPill + clase CSS). CSS en
 * presentation/modules/finanzas/pagos/styles/pagos-list.css.
 *
 * Estados del aporte (del backend):
 *   PENDIENTE → pendiente · PARCIAL → parcial · CANCELADO → cancelado
 */

const ESTADO_MOD = {
  PENDIENTE: 'pendiente',
  PARCIAL: 'parcial',
  CANCELADO: 'cancelado',
};

const ESTADO_LABEL = {
  PENDIENTE: 'Pendiente',
  PARCIAL: 'Parcial',
  CANCELADO: 'Cancelado',
};

/** Etiqueta legible del estado del aporte. */
export const formatEstadoPago = (estado) =>
  ESTADO_LABEL[String(estado || '').toUpperCase()] ?? estado ?? 'Sin estado';

/** Clave de modificador normalizada del estado (default = pendiente). */
const estadoMod = (estado) => ESTADO_MOD[String(estado || '').toUpperCase()] ?? 'pendiente';

/** Clase del pill (StatusPill) que tiñe el estado del aporte. */
export const getEstadoPagoPillClass = (estado) =>
  `pago-pill pago-pill--${estadoMod(estado)}`;

/** Clase que tiñe el dot + etiqueta del estado bajo el nombre del estudiante. */
export const getEstadoPagoTextClass = (estado) => `pago-estado--${estadoMod(estado)}`;

/**
 * Saldo pendiente → clase de pill por severidad. Saldo 0 = al día (verde),
 * saldo > 0 = pendiente (rojo). Solo la clase; la etiqueta la formatea la columna.
 */
export const getSaldoPillClass = (saldo) =>
  Number(saldo) > 0 ? 'pago-pill pago-pill--saldo' : 'pago-pill pago-pill--aldia';

/**
 * % cubierto del aporte (0–100) → clase de pill por avance: 100 = cubierto
 * (verde), 1–99 = parcial (ámbar), 0 = sin pagos (rojo). Solo la clase.
 */
export const getPorcentajeCubiertoPillClass = (porcentaje) => {
  const n = Number(porcentaje) || 0;
  if (n >= 100) return 'pago-pill pago-pill--cancelado';
  if (n > 0) return 'pago-pill pago-pill--parcial';
  return 'pago-pill pago-pill--pendiente';
};
