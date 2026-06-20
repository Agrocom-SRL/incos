/**
 * pagoStatusOf — mapea el estado de pago a un tono de StatusPill del studio.
 * Función PURA (sin React, sin i18n). 'Al día' → ok; 'Pendiente' → err;
 * cualquier otro valor conocido cae a info.
 */
export function pagoStatusOf(estadoPago) {
  const e = String(estadoPago || '').trim().toLowerCase();
  if (e === 'al día' || e === 'al dia') return { tone: 'ok' };
  if (e === 'pendiente') return { tone: 'err' };
  return { tone: 'info' };
}

export default pagoStatusOf;
