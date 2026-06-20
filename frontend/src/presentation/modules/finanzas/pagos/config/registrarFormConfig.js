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

// Códigos de método de pago (1=EFECTIVO, 2=QR, 3=TRANSFERENCIA, 4=DEPOSITO) — fuente única en el mapper.
import { METODO_CODIGO } from '@application-finanzas/mappers/pagosRegistrarMapper';

export { METODO_CODIGO };

/** Devuelve el código de método (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO) por id seleccionado. */
export const findMetodoCodigo = (metodos = [], metodoPagoId) => {
  const metodo = metodos.find((m) => m.id === metodoPagoId);
  return metodo?.codigo || '';
};

/**
 * Reglas de visibilidad/obligatoriedad por método de pago. Espeja FUNCIONALMENTE el
 * validator del backend (cuenta y comprobante requeridos según método). Fuente única
 * compartida entre el formulario de registro y el de edición de cuota.
 *
 *   - EFECTIVO (1):      sin cuenta, sin comprobante.
 *   - QR (2):            comprobante requerido; cuenta opcional/visible.
 *   - TRANSFERENCIA (3): cuenta requerida; comprobante requerido.
 *   - DEPOSITO (4):      cuenta requerida; comprobante requerido.
 *
 * @param {string} metodoCodigo - Código del método seleccionado.
 */
export const buildReglasMetodo = (metodoCodigo) => {
  const esEfectivo = metodoCodigo === METODO_CODIGO.EFECTIVO;
  const esQR = metodoCodigo === METODO_CODIGO.QR;
  const esTransferencia = metodoCodigo === METODO_CODIGO.TRANSFERENCIA;
  const esDeposito = metodoCodigo === METODO_CODIGO.DEPOSITO;
  return {
    esEfectivo,
    esQR,
    esTransferencia,
    esDeposito,
    cuentaRequerida: esTransferencia || esDeposito,
    cuentaVisible: esQR || esTransferencia || esDeposito,
    comprobanteRequerido: esQR || esTransferencia || esDeposito,
    comprobanteVisible: esQR || esTransferencia || esDeposito,
  };
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
