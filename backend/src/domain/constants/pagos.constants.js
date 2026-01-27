/**
 * Constantes para el módulo de Pagos
 */

// Estados del aporte académico (cabecera pago_aporte: PENDIENTE=sin pagos, PARCIAL=algún pago, CANCELADO=total pagado)
export const ESTADOS_PAGO_APORTE = {
  PENDIENTE: 'PENDIENTE',
  PARCIAL: 'PARCIAL',
  CANCELADO: 'CANCELADO',
};

export const ESTADOS_PAGO_APORTE_VALUES = Object.values(ESTADOS_PAGO_APORTE);

// Métodos de pago
export const METODOS_PAGO = {
  EFECTIVO: 'EFECTIVO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  DEPOSITO: 'DEPOSITO',
  TARJETA: 'TARJETA',
  QR: 'QR',
  OTRO: 'OTRO',
};

export const METODOS_PAGO_VALUES = Object.values(METODOS_PAGO);
