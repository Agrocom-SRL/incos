import { idiomaListMapper } from './idiomaListMapper';

const IDIOMA_FORM_EMPTY = {
  nombre: '',
  codigoIso: '',
};

/** API → valores de formulario */
export const mapIdiomaToFormValues = (raw) => {
  const i = idiomaListMapper(raw) || raw;
  if (!i) return { ...IDIOMA_FORM_EMPTY };
  return {
    ...IDIOMA_FORM_EMPTY,
    nombre: i.nombre ?? '',
    codigoIso: i.codigoIso ?? '',
  };
};

/** Formulario → payload API */
export const mapFormValuesToIdiomaPayload = (values) => ({
  nombre: values.nombre?.trim(),
  codigoIso: values.codigoIso?.trim().toUpperCase() || undefined,
});

/** API detalle → modelo UI */
export const mapIdiomaDetail = (raw) => {
  const payload = raw?.idioma ?? raw;
  const base = idiomaListMapper(payload) || payload;
  if (!base) return null;
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
    cantidadEstudiantes: payload?.cantidadEstudiantes ?? 0,
    cantidadDocentes: payload?.cantidadDocentes ?? 0,
    cantidadPersonal: payload?.cantidadPersonal ?? 0,
  };
};
