/**
 * Mapper: discapacidadListMapper
 * 
 * Single Responsibility: Transformar datos del backend al formato necesario para la lista
 * 
 * Mapea los datos completos del tipo de discapacidad a un formato simplificado
 * para la visualización en la lista de discapacidades.
 * 
 * NOTA: El backend devuelve entidades DisabilityType con propiedades en inglés (camelCase):
 * - name, description
 * 
 * Ubicación: application/modules/configuracion/complementario/discapacidad/mappers
 * 
 * @param {Object} discapacidadBackend - Datos del tipo de discapacidad desde el backend (en inglés)
 * @returns {Object} - Datos mapeados para la lista (en español/camelCase)
 */
export const discapacidadListMapper = (discapacidadBackend) => {
  if (!discapacidadBackend) {
    return null;
  }

  return {
    id: discapacidadBackend.id,
    nombre: discapacidadBackend.name,
    descripcion: discapacidadBackend.description,
  };
};

/**
 * Mapea un array de tipos de discapacidad del backend al formato de lista
 * 
 * @param {Array} discapacidadesBackend - Array de tipos de discapacidad desde el backend
 * @returns {Array} - Array de tipos de discapacidad mapeados para la lista
 */
export const mapDiscapacidadesList = (discapacidadesBackend) => {
  if (!Array.isArray(discapacidadesBackend)) {
    return [];
  }

  return discapacidadesBackend.map(discapacidadListMapper).filter(Boolean);
};

