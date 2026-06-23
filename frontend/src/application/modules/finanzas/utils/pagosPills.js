/**
 * Mapea estado del aporte, saldo y descuento por beca a su clase de pill/dot de
 * color (mismo enfoque que `licenciaPills` de Asistencia y `cuentasPorCobrarPills`:
 * StatusPill + clase CSS). CSS en
 * presentation/modules/finanzas/pagos/styles/pagos-list.css.
 *
 * El ESTADO visible bajo el nombre del estudiante se DERIVA en el front (no se
 * confía solo en el `estado` del backend) para poder distinguir "Sin pagos":
 *   cancelado → verde  (saldoPendiente <= 0; incluye becas 100 %)
 *   sinPagos  → rojo   (no pagó nada: totalPagado <= 0 o sin cuotas, y aún debe)
 *   parcial   → ámbar  (pagó algo pero aún debe)
 */

const ESTADO_MOD = {
  SIN_PAGOS: 'sin-pagos',
  CANCELADO: 'cancelado',
  PARCIAL: 'parcial',
};

const ESTADO_LABEL = {
  SIN_PAGOS: 'Sin pagos',
  CANCELADO: 'Cancelado',
  PARCIAL: 'Parcial',
};

/**
 * Deriva el estado de pago de un registro a partir de sus cifras (no del campo
 * `estado` del backend, que no distingue "sin pagos"). Devuelve una de las claves
 * de `ESTADO_MOD`.
 */
export const derivarEstadoPago = ({ cantidadPagos, totalPagado, saldoPendiente }) => {
  // Saldado (incluye becas 100 %): aunque no haya pago en efectivo, ya no debe.
  if ((Number(saldoPendiente) || 0) <= 0) return 'CANCELADO';
  // Aún debe: si no pagó nada efectivamente (monto 0 o sin cuotas) → Sin pagos.
  const pagado = Number(totalPagado) || 0;
  const cuotas = Number(cantidadPagos) || 0;
  if (pagado <= 0 || cuotas === 0) return 'SIN_PAGOS';
  return 'PARCIAL';
};

/** Etiqueta legible del estado de pago derivado. */
export const formatEstadoPago = (estadoKey) => ESTADO_LABEL[estadoKey] ?? 'Sin estado';

/** Clave de modificador normalizada del estado derivado (default = parcial). */
const estadoMod = (estadoKey) => ESTADO_MOD[estadoKey] ?? 'parcial';

/** Clase del pill (StatusPill) que tiñe el estado del aporte. */
export const getEstadoPagoPillClass = (estadoKey) => `pago-pill pago-pill--${estadoMod(estadoKey)}`;

/** Clase que tiñe el dot + etiqueta del estado bajo el nombre del estudiante. */
export const getEstadoPagoTextClass = (estadoKey) => `pago-estado--${estadoMod(estadoKey)}`;

/**
 * Saldo pendiente → clase de pill por severidad. Saldo <= 0 = saldado (verde),
 * saldo > 0 = pendiente (rojo). Solo la clase; la etiqueta la formatea la columna.
 */
export const getSaldoPillClass = (saldo) =>
  Number(saldo) > 0 ? 'pago-pill pago-pill--saldo' : 'pago-pill pago-pill--aldia';

/**
 * Descuento por beca → clase de pill según el porcentaje de beca:
 *   warning (ámbar)  → < 50 %
 *   info    (azul)   → 50 % a 99 %
 *   primary (marca)  → 100 %
 *   neutro           → sin beca (porcentaje null o 0)
 */
export const getDescuentoPillClass = (porcentaje) => {
  const n = Number(porcentaje);
  if (!Number.isFinite(n) || n <= 0) return 'pago-pill pago-pill--neutro';
  if (n >= 100) return 'pago-pill pago-pill--beca-total';
  if (n >= 50) return 'pago-pill pago-pill--beca-media';
  return 'pago-pill pago-pill--beca-baja';
};
