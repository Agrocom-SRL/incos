import { actividadListMapper } from './actividadListMapper';

const ACTIVIDAD_FORM_EMPTY = {
  nombre: '',
  descripcion: '',
  tipo: undefined,
  esDestacada: false,
  icono: '',
};

/** API → valores de formulario */
export const mapActividadToFormValues = (raw) => {
  const a = actividadListMapper(raw) || raw;
  if (!a) return { ...ACTIVIDAD_FORM_EMPTY };
  return {
    ...ACTIVIDAD_FORM_EMPTY,
    nombre: a.nombre ?? '',
    descripcion: a.descripcion ?? '',
    tipo: a.tipo ?? undefined,
    esDestacada: Boolean(a.esDestacada),
    icono: a.icono ?? '',
  };
};

/** Formulario → payload API */
export const mapFormValuesToActividadPayload = (values) => ({
  nombre: values.nombre?.trim(),
  descripcion: values.descripcion?.trim() || undefined,
  tipo: values.tipo || undefined,
  esDestacada: Boolean(values.esDestacada),
  icono: values.icono?.trim() || undefined,
});

/** API detalle → modelo UI */
export const mapActividadDetail = (raw) => {
  const payload = raw?.actividad ?? raw;
  const base = actividadListMapper(payload) || payload;
  if (!base) return null;
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
  };
};
