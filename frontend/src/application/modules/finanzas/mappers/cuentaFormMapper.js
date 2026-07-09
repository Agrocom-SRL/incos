/**
 * Mapper de formulario: CUENTA de pago (Config. de pagos · Finanzas).
 * Mismo shape que armaba el `CuentaDrawer` retirado. El QR se extrae del
 * `fileList` igual que su `handleFinish`.
 */

const CUENTA_FORM_EMPTY = {
  nombreTitular: '',
  metodoPagoId: undefined,
  bancoId: undefined,
  numeroCuenta: '',
  numeroCelular: '',
  qr: [],
};

/** API (catálogo del contexto) → valores de formulario. */
export const mapCuentaToFormValues = (cuenta) => {
  if (!cuenta) return { ...CUENTA_FORM_EMPTY };
  return {
    nombreTitular: cuenta.nombreTitular ?? '',
    metodoPagoId: cuenta.metodoPagoId ?? undefined,
    bancoId: cuenta.bancoId ?? undefined,
    numeroCuenta: cuenta.numeroCuenta ?? '',
    numeroCelular: cuenta.numeroCelular ?? '',
    qr: [],
    // `activo` solo aplica en modo edición (se asigna al crear, ver formSections).
    ...(cuenta.activo != null ? { activo: cuenta.activo } : {}),
  };
};

/** Extrae el `File` del fileList del campo `qr` (mismo criterio que el `CuentaDrawer` retirado). */
const extraerArchivoQr = (qr) => {
  if (!Array.isArray(qr) || qr.length === 0) return undefined;
  const file = qr[0];
  return file?.originFileObj || file;
};

/** Formulario → payload API ({ nombre_titular, metodo_pago_id, banco_id, ... }). */
export const mapFormValuesToCuentaPayload = (values, { isEditMode = false } = {}) => ({
  nombre_titular: values.nombreTitular?.trim(),
  metodo_pago_id: values.metodoPagoId ?? null,
  banco_id: values.bancoId ?? null,
  numero_cuenta: values.numeroCuenta?.trim() || null,
  numero_celular: values.numeroCelular?.trim() || null,
  activo: isEditMode ? (values.activo == null ? true : !!values.activo) : true,
  qr: extraerArchivoQr(values.qr),
});

export default mapCuentaToFormValues;
