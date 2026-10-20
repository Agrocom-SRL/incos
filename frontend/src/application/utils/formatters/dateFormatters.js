/**
 * Formatters de fecha — presentación en español (es-BO), sin dependencias de
 * zona horaria (se opera sobre los componentes Y-M-D del valor recibido).
 *
 * Clean Architecture:
 * - Application Layer: utilidades compartidas entre módulos.
 */

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

/** Normaliza string 'YYYY-MM-DD', Date o dayjs a 'YYYY-MM-DD' (o null). */
const toISO = (fecha) => {
  if (!fecha) return null;
  if (typeof fecha === 'string') return fecha.slice(0, 10);
  if (typeof fecha.format === 'function') return fecha.format('YYYY-MM-DD');
  if (fecha instanceof Date && !Number.isNaN(fecha.getTime())) {
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${m}-${d}`;
  }
  return null;
};

/**
 * Fecha en forma literal: '13 de agosto de 2026'.
 * @param {string|Date|Object|null} fecha - 'YYYY-MM-DD', Date o dayjs
 * @returns {string} fecha literal o '—' si no hay
 */
export const formatFechaLiteral = (fecha) => {
  const iso = toISO(fecha);
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d || !MESES[m - 1]) return iso;
  return `${d} de ${MESES[m - 1]} de ${y}`;
};

/**
 * Fecha corta 'DD/MM/YYYY' (para celdas de tabla).
 * @param {string|Date|Object|null} fecha - 'YYYY-MM-DD', Date o dayjs
 * @returns {string} fecha corta o '—' si no hay
 */
export const formatFechaCorta = (fecha) => {
  const iso = toISO(fecha);
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
};
