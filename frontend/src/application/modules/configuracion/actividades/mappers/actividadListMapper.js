/**
 * Mapper: actividadListMapper
 *
 * Single Responsibility: Transformar datos del backend (actividades, catálogo
 * maestro) al formato necesario para la lista. dataFieldName backend =
 * 'actividades' (`ListActividadesUseCase`).
 *
 * Ubicación: application/modules/configuracion/actividades/mappers
 */
export const actividadListMapper = (actividadBackend) => {
  if (!actividadBackend) {
    return null;
  }

  return {
    id: actividadBackend.id,
    nombre: actividadBackend.nombre,
    descripcion: actividadBackend.descripcion,
    tipo: actividadBackend.tipo,
    esDestacada: Boolean(actividadBackend.esDestacada),
    icono: actividadBackend.icono,
    activo: actividadBackend.activo,
  };
};

/**
 * Mapea un array de actividades del backend al formato de lista
 */
export const mapActividadesList = (actividadesBackend) => {
  if (!Array.isArray(actividadesBackend)) {
    return [];
  }

  return actividadesBackend.map(actividadListMapper).filter(Boolean);
};
