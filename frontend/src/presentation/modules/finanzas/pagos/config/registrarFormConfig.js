/**
 * Config del formulario de registro de abono (Finanzas).
 *
 * Centraliza helpers de formato y reglas de validación de AntD (Form rules) para
 * que la página y los organismos solo compongan. Sin literales de estilo: estos
 * son valores de negocio/validación, no de presentación.
 */

/** Formatea un monto en bolivianos (Bs 1.234,50). */
export const formatBolivianos = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `Bs ${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Tipos de archivo aceptados como comprobante de respaldo. */
export const COMPROBANTE_ACCEPT = '.pdf,.jpg,.jpeg,.png';
/** Tamaño máximo del comprobante en MB. */
export const COMPROBANTE_MAX_MB = 5;

/** Normaliza el valor del Upload de AntD para que Form lo reciba como fileList. */
export const normFileFromUpload = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
};

/**
 * Construye las reglas (Form rules) del campo monto según el saldo pendiente.
 * @param {number} saldoPendiente
 */
export const buildMontoRules = (saldoPendiente) => [
  { required: true, message: 'Ingrese el monto del abono' },
  {
    validator: (_, value) => {
      const monto = Number(value);
      if (!Number.isFinite(monto) || monto < 0) {
        return Promise.reject(new Error('El monto debe ser mayor o igual a 0'));
      }
      if (saldoPendiente > 0 && monto > saldoPendiente) {
        return Promise.reject(
          new Error(`El monto no puede superar el saldo pendiente (${formatBolivianos(saldoPendiente)})`),
        );
      }
      return Promise.resolve();
    },
  },
];
