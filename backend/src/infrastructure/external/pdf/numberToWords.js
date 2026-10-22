/**
 * numberToWords - Conversión de números a palabras en español.
 *
 * Extraído de `ReciboPagoPdfGenerator._numberToWords` (que queda intacto,
 * sin tocar — ver nota abajo) y extendido con soporte de miles para poder
 * escribir años en letras (ej. acta de defensa: "dos mil veintiséis").
 *
 * TODO (unificación pendiente, sin bloquear esta extensión): migrar
 * `ReciboPagoPdfGenerator` para que delegue en este helper en vez de su
 * método privado — se dejó sin tocar para no arriesgar el generador de
 * recibos ya en producción; ambos implementan el mismo algoritmo para
 * decenas/unidades (0-99), por lo que el monto en letras de un recibo
 * (siempre < 1000 Bs en la práctica) no cambia de resultado.
 *
 * Las centenas irregulares (500 "quinientos", 700 "setecientos", 900
 * "novecientos") se resuelven aquí; el método privado del recibo normal las
 * sigue escribiendo mal (cincocientos), por eso los recibos de Capacitación
 * usan este helper.
 */

const UNIDADES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const DECENAS = [
  '',
  '',
  'veinte',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
];
// Centenas irregulares del español (500, 700, 900 no siguen "<unidad>cientos").
const CENTENAS_IRREGULARES = { 5: 'quinientos', 7: 'setecientos', 9: 'novecientos' };
const nombreCentena = (centena) =>
  centena === 1 ? 'ciento' : CENTENAS_IRREGULARES[centena] ?? `${UNIDADES[centena]}cientos`;

const ESPECIALES = [
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
];

/**
 * @param {number} num - Entero >= 0 (se toma el valor absoluto truncado)
 * @returns {string} Número en palabras (español)
 */
export function numberToWords(num) {
  const n = Math.trunc(Math.abs(Number(num) || 0));
  if (n === 0) return 'cero';
  if (n < 10) return UNIDADES[n];
  if (n < 20) return ESPECIALES[n - 10];
  if (n < 100) {
    const decena = Math.floor(n / 10);
    const unidad = n % 10;
    return unidad === 0 ? DECENAS[decena] : `${DECENAS[decena]} y ${UNIDADES[unidad]}`;
  }
  if (n < 1000) {
    const centena = Math.floor(n / 100);
    const resto = n % 100;
    if (resto === 0) return centena === 1 ? 'cien' : nombreCentena(centena);
    return `${nombreCentena(centena)} ${numberToWords(resto)}`;
  }
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  const prefijo = miles === 1 ? 'mil' : `${numberToWords(miles)} mil`;
  return resto > 0 ? `${prefijo} ${numberToWords(resto)}` : prefijo;
}

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * Fecha ISO (YYYY-MM-DD) → "{día en letras} de {mes} de {año en letras}".
 * @param {string} fechaIso
 * @returns {string}
 */
export function fechaEnLetras(fechaIso) {
  if (!fechaIso) return '';
  const [anio, mes, dia] = String(fechaIso).slice(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) return '';
  const mesNombre = MESES[mes - 1] ?? '';
  return `${numberToWords(dia)} de ${mesNombre} de ${numberToWords(anio)}`;
}
