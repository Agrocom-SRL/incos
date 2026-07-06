import { discapacidadListMapper } from './discapacidadListMapper';

const DISCAPACIDAD_FORM_EMPTY = {
  nombre: '',
  descripcion: '',
};

/** API → valores de formulario */
export const mapDiscapacidadToFormValues = (raw) => {
  const d = discapacidadListMapper(raw) || raw;
  if (!d) return { ...DISCAPACIDAD_FORM_EMPTY };
  return {
    ...DISCAPACIDAD_FORM_EMPTY,
    nombre: d.nombre ?? '',
    descripcion: d.descripcion ?? '',
  };
};

/** Formulario → payload API */
export const mapFormValuesToDiscapacidadPayload = (values) => ({
  nombre: values.nombre?.trim(),
  descripcion: values.descripcion?.trim() || undefined,
});

/** API detalle → modelo UI */
export const mapDiscapacidadDetail = (raw) => {
  const payload = raw?.discapacidad ?? raw;
  const base = discapacidadListMapper(payload) || payload;
  if (!base) return null;
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
  };
};
