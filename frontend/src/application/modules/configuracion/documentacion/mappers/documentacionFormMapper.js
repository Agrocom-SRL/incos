import { documentacionListMapper } from './documentacionListMapper';

const DOCUMENTACION_FORM_EMPTY = {
  nombre: '',
  tipoDocumento: undefined,
  documentoPadreId: undefined,
  aceptaFotocopia: false,
  requerido: true,
  orden: 0,
  descripcion: '',
};

/** API → valores de formulario (pantalla única: el tipo se edita en el form) */
export const mapDocumentacionToFormValues = (raw) => {
  const d = documentacionListMapper(raw) || raw;
  if (!d) return { ...DOCUMENTACION_FORM_EMPTY };
  return {
    ...DOCUMENTACION_FORM_EMPTY,
    nombre: d.nombre ?? '',
    tipoDocumento: d.tipoDocumento ?? undefined,
    documentoPadreId: d.documentoPadreId ?? undefined,
    aceptaFotocopia: Boolean(d.aceptaFotocopia),
    requerido: d.requerido !== false,
    orden: d.orden ?? 0,
    descripcion: d.descripcion ?? '',
  };
};

/** Formulario → payload API (tipoDocumento sale del Select del form) */
export const mapFormValuesToDocumentacionPayload = (values) => ({
  nombre: values.nombre?.trim(),
  tipoDocumento: values.tipoDocumento,
  documentoPadreId: values.documentoPadreId || undefined,
  aceptaFotocopia: Boolean(values.aceptaFotocopia),
  requerido: values.requerido !== false,
  orden: Number.isFinite(values.orden) ? values.orden : 0,
  descripcion: values.descripcion?.trim() || undefined,
});

/** API detalle → modelo UI */
export const mapDocumentacionDetail = (raw) => {
  const payload = raw?.documentacion ?? raw;
  const base = documentacionListMapper(payload) || payload;
  if (!base) return null;
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
  };
};
