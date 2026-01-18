/**
 * Constantes para el módulo de Pagos
 */

// Estados de pago
export const ESTADOS_PAGO = {
  PENDIENTE: 'PENDIENTE',
  PAGADO: 'PAGADO',
  PARCIAL: 'PARCIAL',
  VENCIDO: 'VENCIDO',
  ANULADO: 'ANULADO',
};

export const ESTADOS_PAGO_VALUES = Object.values(ESTADOS_PAGO);

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
