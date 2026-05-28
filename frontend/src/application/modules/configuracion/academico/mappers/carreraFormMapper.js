import { carreraListMapper } from './carreraListMapper';

/** API → valores de formulario Ant Design */
export const mapCarreraToFormValues = (raw) => {
  const c = carreraListMapper(raw) || raw;
  if (!c) return { activo: true, colorHex: '#52c41a' };
  return {
    codigo: c.codigo ?? '',
    nombre: c.nombre ?? '',
    descripcion: c.descripcion ?? '',
    areaFormacion: c.areaFormacion ?? '',
    tituloOtorgado: c.tituloOtorgado ?? '',
    colorHex: c.colorHex || '#52c41a',
    imagenRuta: c.imagenRuta ?? '',
    activo: c.activo !== false,
  };
};

/** Formulario → payload API (acepta snake_case y camelCase en backend) */
export const mapFormValuesToCarreraPayload = (values) => ({
  codigo: values.codigo?.trim() || undefined,
  nombre: values.nombre?.trim(),
  descripcion: values.descripcion?.trim() || undefined,
  areaFormacion: values.areaFormacion?.trim() || undefined,
  tituloOtorgado: values.tituloOtorgado?.trim() || undefined,
  colorHex: values.colorHex || undefined,
  imagenRuta: values.imagenRuta?.trim() || undefined,
  activo: values.activo !== false,
});

export const mapCarreraDetail = (raw) => {
  const base = carreraListMapper(raw) || raw;
  if (!base) return null;
  return {
    ...base,
    activo: raw?.activo !== false,
  };
};
