import { materiaListMapper } from './materiaListMapper';

/** API → valores de formulario */
export const mapMateriaToFormValues = (raw) => {
  const m = materiaListMapper(raw) || raw;
  if (!m) {
    return { activo: true, tipo: 'TEORICA_PRACTICA' };
  }
  return {
    sigla: m.sigla ?? '',
    nombre: m.nombre ?? '',
    objetivos: m.objetivos ?? '',
    tipo: m.tipo ?? 'TEORICA_PRACTICA',
    clasificacion: m.clasificacion ? [m.clasificacion] : [],
    activo: m.activo !== false,
  };
};

/** Formulario → payload API */
export const mapFormValuesToMateriaPayload = (values) => ({
  sigla: values.sigla?.trim(),
  nombre: values.nombre?.trim(),
  objetivos: values.objetivos?.trim() || undefined,
  tipo: values.tipo || 'TEORICA_PRACTICA',
  clasificacion: (Array.isArray(values.clasificacion)
    ? values.clasificacion[0]
    : values.clasificacion
  )?.trim() || undefined,
  activo: values.activo !== false,
});

export const mapMateriaDetail = (raw) => {
  const base = materiaListMapper(raw) || raw;
  if (!base) return null;
  return {
    ...base,
    activo: raw?.activo !== false,
  };
};
