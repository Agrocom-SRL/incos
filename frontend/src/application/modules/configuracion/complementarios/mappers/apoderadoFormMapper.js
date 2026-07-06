import { apoderadoListMapper } from './apoderadoListMapper';

const APODERADO_FORM_EMPTY = {
  nombre: '',
  descripcion: '',
};

/** API → valores de formulario */
export const mapApoderadoToFormValues = (raw) => {
  const a = apoderadoListMapper(raw) || raw;
  if (!a) return { ...APODERADO_FORM_EMPTY };
  return {
    ...APODERADO_FORM_EMPTY,
    nombre: a.nombre ?? '',
    descripcion: a.descripcion ?? '',
  };
};

/** Formulario → payload API */
export const mapFormValuesToApoderadoPayload = (values) => ({
  nombre: values.nombre?.trim(),
  descripcion: values.descripcion?.trim() || undefined,
});

/** API detalle → modelo UI */
export const mapApoderadoDetail = (raw) => {
  const payload = raw?.tipoParentesco ?? raw;
  const base = apoderadoListMapper(payload) || payload;
  if (!base) return null;
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
  };
};
