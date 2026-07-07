/**
 * Mapper: aulaListMapper
 *
 * Single Responsibility: Transformar datos del backend (aulas) al formato
 * necesario para la lista.
 *
 * NOTA: El backend devuelve entidades Classroom en formato de presentación
 * (español, camelCase): codigo, nombre, categoria, capacidad, observaciones,
 * activo. dataFieldName='aulas' (list) / 'aula' (get/create/update).
 *
 * Ubicación: application/modules/configuracion/recursos/mappers
 */
export const aulaListMapper = (aulaBackend) => {
  if (!aulaBackend) {
    return null;
  }

  return {
    id: aulaBackend.id,
    codigo: aulaBackend.codigo,
    nombre: aulaBackend.nombre,
    categoria: aulaBackend.categoria,
    capacidad: aulaBackend.capacidad,
    observaciones: aulaBackend.observaciones,
    activo: aulaBackend.activo,
  };
};

/**
 * Mapea un array de aulas del backend al formato de lista
 */
export const mapAulasList = (aulasBackend) => {
  if (!Array.isArray(aulasBackend)) {
    return [];
  }

  return aulasBackend.map(aulaListMapper).filter(Boolean);
};
