import { estadoCivilListMapper } from './estadoCivilListMapper';

const ESTADO_CIVIL_FORM_EMPTY = {
  nombre: '',
  abreviatura: '',
};

/** API → valores de formulario */
export const mapEstadoCivilToFormValues = (raw) => {
  const e = estadoCivilListMapper(raw) || raw;
  if (!e) return { ...ESTADO_CIVIL_FORM_EMPTY };
  return {
    ...ESTADO_CIVIL_FORM_EMPTY,
    nombre: e.nombre ?? '',
    abreviatura: e.abreviatura ?? '',
  };
};

/** Formulario → payload API */
export const mapFormValuesToEstadoCivilPayload = (values) => ({
  nombre: values.nombre?.trim(),
  abreviatura: values.abreviatura?.trim().toUpperCase() || undefined,
});

/** API detalle → modelo UI */
export const mapEstadoCivilDetail = (raw) => {
  const payload = raw?.estadoCivil ?? raw;
  const base = estadoCivilListMapper(payload) || payload;
  if (!base) return null;
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
  };
};
