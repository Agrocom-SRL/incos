/**
 * Mapper: carreraListMapper
 * 
 * Single Responsibility: Transformar datos del backend al formato necesario para la lista
 * 
 * Mapea los datos completos de la carrera a un formato simplificado
 * para la visualización en la lista de carreras.
 * 
 * NOTA: El backend devuelve entidades Career con propiedades en inglés (camelCase):
 * - code, name, durationYears, grantedTitle, totalHours
 * 
 * Ubicación: application/modules/configuracion/academico/carreras/mappers
 * 
 * @param {Object} carreraBackend - Datos de la carrera desde el backend (en inglés)
 * @returns {Object} - Datos mapeados para la lista (en español/camelCase)
 */
export const carreraListMapper = (carreraBackend) => {
  if (!carreraBackend) {
    return null;
  }

  return {
    id: carreraBackend.id,
    codigo: carreraBackend.code,
    nombre: carreraBackend.name,
    duracionAnios: carreraBackend.durationYears,
    tituloOtorgado: carreraBackend.grantedTitle,
    cargaHorariaTotal: carreraBackend.totalHours,
  };
};

/**
 * Mapea un array de carreras del backend al formato de lista
 * 
 * @param {Array} carrerasBackend - Array de carreras desde el backend
 * @returns {Array} - Array de carreras mapeadas para la lista
 */
export const mapCarrerasList = (carrerasBackend) => {
  if (!Array.isArray(carrerasBackend)) {
    return [];
  }

  return carrerasBackend.map(carreraListMapper).filter(Boolean);
};

