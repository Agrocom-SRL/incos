/**
 * Mapper de formulario: MÉTODO de pago (Config. de pagos · Finanzas).
 * Catálogo fijo (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO): solo edición, único
 * campo editable es el nombre visible.
 */

/** API (catálogo del contexto) → valores de formulario. */
export const mapMetodoToFormValues = (metodo) => ({ nombre: metodo?.nombre ?? '' });

/** Formulario → payload API ({ nombre }). */
export const mapFormValuesToMetodoPayload = (values) => ({ nombre: values.nombre?.trim() });

export default mapMetodoToFormValues;
