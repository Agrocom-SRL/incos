/**
 * Mapper: compromiso de pago de un aporte (API → DTO, módulo Finanzas).
 *
 * El backend ya entrega el compromiso con claves de dominio (camelCase):
 *   { id, pagoAporteId, fechaCompromiso, observacion,
 *     estado, activo, createdAt, updatedAt } | null.
 *
 * El saldo se deriva de las cuotas, por lo que el compromiso NO lleva monto: solo
 * compromete una fecha de regularización (y una observación opcional). Este mapper
 * normaliza textos y deja la fecha como string 'YYYY-MM-DD' (el formulario la
 * convierte a dayjs al precargar). El módulo Finanzas es independiente del legacy `@pagos`.
 */

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

/** Fecha DATEONLY a 'YYYY-MM-DD' (ignora hora si el backend la incluyera). */
const toFechaSolo = (value) => {
  if (value == null || value === '') return null;
  return String(value).slice(0, 10);
};

/**
 * Normaliza el compromiso de pago vigente (o null).
 * @param {Object|null} raw - data.compromiso del backend.
 * @returns {Object|null}
 */
export const mapCompromisoFromApi = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  return {
    id: raw.id ?? null,
    pagoAporteId: raw.pagoAporteId ?? null,
    fechaCompromiso: toFechaSolo(raw.fechaCompromiso),
    observacion: cleanText(raw.observacion),
    estado: cleanText(raw.estado),
    activo: raw.activo ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};

/**
 * Arma el payload del backend (snake_case) desde los valores del formulario.
 * `fecha_compromiso` es requerida (YYYY-MM-DD); observación opcional.
 *
 * @param {Object} values - { fechaCompromiso: 'YYYY-MM-DD', observacion? }
 * @returns {Object}
 */
export const mapCompromisoToApi = (values = {}) => ({
  fecha_compromiso: values.fechaCompromiso ?? null,
  observacion: cleanText(values.observacion),
});
