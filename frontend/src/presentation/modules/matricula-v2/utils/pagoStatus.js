/**
 * Mapeo único estado de pago → presentación. Evita repetir la comparación de
 * strings ('Al día'/'Pendiente') en tabla, detalle expandible y drawer.
 * @param {string} estadoPago
 * @returns {{ status: 'ok' | 'err' | 'info', tagColor: 'green' | 'red' | 'blue' }}
 */
export function pagoStatusOf(estadoPago) {
  if (estadoPago === 'Al día') return { status: 'ok', tagColor: 'green' };
  if (estadoPago === 'Pendiente') return { status: 'err', tagColor: 'red' };
  return { status: 'info', tagColor: 'blue' };
}

export default pagoStatusOf;
