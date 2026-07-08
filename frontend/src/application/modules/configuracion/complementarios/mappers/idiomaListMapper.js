/**
 * Mapper: idiomaListMapper
 *
 * Single Responsibility: Transformar datos del backend (idiomas) al formato
 * necesario para la lista.
 *
 * NOTA: El backend devuelve entidades Language con propiedades en español
 * (camelCase): nombre, codigoIso, activo. dataFieldName='idiomas'.
 *
 * Ubicación: application/modules/configuracion/complementarios/mappers
 */
export const idiomaListMapper = (idiomaBackend) => {
  if (!idiomaBackend) {
    return null;
  }

  return {
    id: idiomaBackend.id,
    nombre: idiomaBackend.nombre,
    codigoIso: idiomaBackend.codigoIso,
    activo: idiomaBackend.activo,
    // Conteos de uso del catálogo (columna "Usos"), 0 por defecto
    cantidadEstudiantes: idiomaBackend.cantidadEstudiantes ?? 0,
    cantidadDocentes: idiomaBackend.cantidadDocentes ?? 0,
    cantidadPersonal: idiomaBackend.cantidadPersonal ?? 0,
  };
};

/**
 * Mapea un array de idiomas del backend al formato de lista
 */
export const mapIdiomasList = (idiomasBackend) => {
  if (!Array.isArray(idiomasBackend)) {
    return [];
  }

  return idiomasBackend.map(idiomaListMapper).filter(Boolean);
};
