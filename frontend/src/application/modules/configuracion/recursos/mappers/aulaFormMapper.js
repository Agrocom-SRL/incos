import { aulaListMapper } from './aulaListMapper';

const AULA_FORM_EMPTY = {
  codigo: '',
  nombre: '',
  categoria: undefined,
  capacidad: undefined,
  observaciones: '',
};

/** API → valores de formulario */
export const mapAulaToFormValues = (raw) => {
  const a = aulaListMapper(raw) || raw;
  if (!a) return { ...AULA_FORM_EMPTY };
  return {
    ...AULA_FORM_EMPTY,
    codigo: a.codigo ?? '',
    nombre: a.nombre ?? '',
    categoria: a.categoria ?? undefined,
    capacidad: a.capacidad ?? undefined,
    observaciones: a.observaciones ?? '',
  };
};

/** Formulario → payload API */
export const mapFormValuesToAulaPayload = (values) => ({
  codigo: values.codigo?.trim(),
  nombre: values.nombre?.trim(),
  categoria: values.categoria || undefined,
  capacidad: values.capacidad != null ? Number(values.capacidad) : undefined,
  observaciones: values.observaciones?.trim() || undefined,
});

/** API detalle → modelo UI */
export const mapAulaDetail = (raw) => {
  const payload = raw?.aula ?? raw;
  const base = aulaListMapper(payload) || payload;
  if (!base) return null;
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
  };
};
