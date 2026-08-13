/**
 * Definición de campos del paso «Datos del pago» del wizard de registro de pago.
 * Mismo patrón que `usuarioWizardCredencialesFields`: configuración declarativa
 * consumida por `FormWorkspaceSection`/`FormField`, para que los inputs sean
 * homogéneos con el resto de formularios del sistema (labels verticales, grid,
 * validación estándar).
 *
 * Archivo .jsx porque incluye nodos React (iconos en la config).
 */

import dayjs from 'dayjs';
import { BankOutlined, FileTextOutlined, QrcodeOutlined } from '@ant-design/icons';

const PRESERVE = { preserve: true };

/** La fecha de pago no puede ser futura. */
const deshabilitarFechasFuturas = (current) => current && current > dayjs().endOf('day');

/**
 * Opciones del select de cuenta de pago: titular - número - banco (código).
 * Réplica del etiquetado histórico de PaymentFormFields.
 */
export function buildCuentaPagoOptions(cuentasPago = [], bancosAutorizados = []) {
  const bancosMap = (Array.isArray(bancosAutorizados) ? bancosAutorizados : []).reduce(
    (map, banco) => {
      map[banco.id] = banco;
      return map;
    },
    {}
  );

  return (Array.isArray(cuentasPago) ? cuentasPago : []).map((cuenta) => {
    const nombreCuenta = cuenta.accountHolderName || cuenta.nombreTitular || cuenta.nombre || '';
    const numeroCuenta = cuenta.accountNumber || cuenta.numeroCuenta || '';
    const banco = cuenta.banco || bancosMap[cuenta.bancoId] || null;
    const bancoNombre = banco?.nombre || cuenta.bancoNombre || null;
    const bancoCodigo = banco?.codigo || cuenta.bancoCodigo || null;

    let label = nombreCuenta;
    if (numeroCuenta) label += ` - ${numeroCuenta}`;
    if (bancoNombre) label += ` - ${bancoCodigo ? `${bancoNombre} (${bancoCodigo})` : bancoNombre}`;

    return { label, value: cuenta.id };
  });
}

/**
 * Campos del comprobante según el método de pago elegido.
 *
 * @param {Object} opciones
 * @param {boolean} opciones.esQR - Método QR (comprobante QR, cuenta opcional)
 * @param {boolean} opciones.requiereCuenta - Cuenta obligatoria (transferencia/depósito)
 * @param {boolean} opciones.mostrarNumeroTransaccion - Nº de transacción (opcional)
 * @param {boolean} opciones.requiereCodigoComprobante - Código de comprobante obligatorio
 * @param {boolean} opciones.mostrarDocumentoRespaldo - Documento de respaldo (opcional)
 * @param {Array} opciones.cuentaOptions - Opciones del select de cuenta (buildCuentaPagoOptions)
 * @param {boolean} opciones.cuentasLoading - Cuentas de pago aún cargando
 */
export function createPagoComprobanteFields({
  esQR = false,
  requiereCuenta = false,
  mostrarNumeroTransaccion = false,
  requiereCodigoComprobante = false,
  mostrarDocumentoRespaldo = false,
  cuentaOptions = [],
  cuentasLoading = false,
} = {}) {
  return [
    {
      key: 'fechaPago',
      name: 'fechaPago',
      label: 'Fecha de pago',
      type: 'date',
      required: true,
      span: 12,
      placeholder: 'Seleccione la fecha',
      disabledDate: deshabilitarFechasFuturas,
      ...PRESERVE,
    },
    ...(requiereCuenta || esQR
      ? [
          {
            key: 'cuentaPagoId',
            name: 'cuentaPagoId',
            label: 'Cuenta de pago',
            type: 'select',
            required: requiereCuenta,
            span: 12,
            placeholder: 'Seleccione una cuenta de pago',
            options: cuentaOptions,
            loading: cuentasLoading,
            icon: <BankOutlined />,
            ...PRESERVE,
          },
        ]
      : []),
    ...(requiereCodigoComprobante
      ? [
          {
            key: 'codigoComprobante',
            name: 'codigoComprobante',
            label: 'Código del comprobante',
            type: 'input',
            inputType: 'text',
            required: true,
            span: 12,
            placeholder: esQR ? 'Código del comprobante QR' : 'Código del comprobante',
            icon: <QrcodeOutlined />,
            ...PRESERVE,
          },
        ]
      : []),
    ...(mostrarNumeroTransaccion
      ? [
          {
            key: 'numeroTransaccion',
            name: 'numeroTransaccion',
            label: 'Número de transacción',
            type: 'input',
            inputType: 'text',
            required: false,
            span: 12,
            placeholder: 'Número de transacción bancaria (opcional)',
            icon: <FileTextOutlined />,
            ...PRESERVE,
          },
        ]
      : []),
    ...(mostrarDocumentoRespaldo
      ? [
          {
            key: 'documentoRespaldo',
            name: 'documentoRespaldo',
            label: 'Documento de respaldo',
            type: 'imageUpload',
            required: false,
            span: 12,
            // Documento, no solo imagen: el dragger relaja la validación de imagen
            // (acceptAnyFile) y el filtro fino queda en `accept`.
            acceptAnyFile: true,
            accept: 'image/*,.pdf,.doc,.docx',
            uploadTitle: 'Arrastre y suelte el archivo aquí',
            uploadTitleChange: 'Cambiar archivo',
            formatsHint: 'Formatos: JPG, PNG, PDF, DOC, DOCX',
            ...PRESERVE,
          },
        ]
      : []),
  ];
}

/**
 * Campo del monto de esta cuota (enteros, acotado al saldo pendiente).
 *
 * @param {Object} opciones
 * @param {number} opciones.saldoMax - Saldo pendiente (máximo permitido)
 */
export function createPagoMontoCuotaFields({ saldoMax = 0 } = {}) {
  const saldoEntero = Math.floor(Number(saldoMax) || 0);
  return [
    {
      key: 'montoCuota',
      name: 'montoCuota',
      label: 'Monto de esta cuota',
      type: 'number',
      required: true,
      span: 12,
      min: 0,
      max: saldoEntero,
      step: 1,
      precision: 0,
      addonBefore: 'Bs.',
      placeholder: String(saldoEntero),
      ...PRESERVE,
    },
  ];
}
