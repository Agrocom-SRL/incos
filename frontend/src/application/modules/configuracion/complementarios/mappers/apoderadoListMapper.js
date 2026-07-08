/**
 * Mapper: apoderadoListMapper
 *
 * Single Responsibility: Transformar datos del backend (tipos de parentesco)
 * al formato necesario para la lista de Apoderados.
 *
 * NOTA: El backend devuelve entidades RelationshipType con propiedades ya en
 * español (camelCase): nombre, descripcion, activo. dataFieldName='tiposParentesco'.
 *
 * Ubicación: application/modules/configuracion/complementarios/mappers
 */
export const apoderadoListMapper = (tipoParentescoBackend) => {
  if (!tipoParentescoBackend) {
    return null;
  }

  return {
    id: tipoParentescoBackend.id,
    nombre: tipoParentescoBackend.nombre,
    descripcion: tipoParentescoBackend.descripcion,
    activo: tipoParentescoBackend.activo,
    // Conteos de uso del catálogo (columna "Usos"), 0 por defecto
    cantidadEstudiantes: tipoParentescoBackend.cantidadEstudiantes ?? 0,
    cantidadDocentes: tipoParentescoBackend.cantidadDocentes ?? 0,
    cantidadPersonal: tipoParentescoBackend.cantidadPersonal ?? 0,
  };
};

/**
 * Mapea un array de tipos de parentesco del backend al formato de lista
 */
export const mapApoderadosList = (tiposParentescoBackend) => {
  if (!Array.isArray(tiposParentescoBackend)) {
    return [];
  }

  return tiposParentescoBackend.map(apoderadoListMapper).filter(Boolean);
};
