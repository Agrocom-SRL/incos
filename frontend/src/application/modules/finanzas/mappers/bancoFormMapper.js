/**
 * Mapper de formulario: BANCO autorizado (Config. de pagos · Finanzas).
 * Mismo shape que armaba el `BancoDrawer` retirado (código, nombre, método de
 * pago, activo), extraído a función pura para `useBancoForm`.
 */

const BANCO_FORM_EMPTY = { codigo: '', nombre: '', metodoPagoId: undefined };

/** API (catálogo del contexto) → valores de formulario. */
export const mapBancoToFormValues = (banco) => {
  if (!banco) return { ...BANCO_FORM_EMPTY };
  return {
    codigo: banco.codigo ?? '',
    nombre: banco.nombre ?? '',
    metodoPagoId: banco.metodoPagoId ?? undefined,
    // `activo` solo aplica en modo edición (se asigna al crear, ver formSections).
    ...(banco.activo != null ? { activo: banco.activo } : {}),
  };
};

/** Formulario → payload API ({ codigo, nombre, metodo_pago_id, activo }). */
export const mapFormValuesToBancoPayload = (values, { isEditMode = false } = {}) => ({
  codigo: values.codigo?.trim(),
  nombre: values.nombre?.trim(),
  metodo_pago_id: values.metodoPagoId ?? null,
  activo: isEditMode ? (values.activo == null ? true : !!values.activo) : true,
});

export default mapBancoToFormValues;
