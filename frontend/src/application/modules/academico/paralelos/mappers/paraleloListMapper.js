/**
 * Mapper: paraleloListMapper
 * 
 * Single Responsibility: Transformar datos del backend al formato necesario para la lista
 * 
 * Mapea los datos completos del paralelo a un formato simplificado
 * para la visualización en la lista de paralelos.
 * 
 * NOTA: El backend devuelve entidades Parallel con propiedades en español (camelCase):
 * - codigo, nombre, descripcion, carreraId, materiaId, etc.
 * 
 * Ubicación: application/modules/academico/paralelos/mappers
 * 
 * @param {Object} paraleloBackend - Datos del paralelo desde el backend (en español)
 * @returns {Object} - Datos mapeados para la lista (en español/camelCase)
 */
export const paraleloListMapper = (paraleloBackend) => {
  if (!paraleloBackend) {
    return null;
  }

  return {
    id: paraleloBackend.id,
    codigo: paraleloBackend.codigo,
    nombre: paraleloBackend.nombre,
    descripcion: paraleloBackend.descripcion,
    turno: paraleloBackend.turno, // Campo importante para el renderItem
    carreraId: paraleloBackend.carreraId,
    periodoId: paraleloBackend.periodoId,
    activo: paraleloBackend.activo,
    // Agregar más campos según la estructura del backend
    // carrera: paraleloBackend.carrera, // Si viene con relación
    // materia: paraleloBackend.materia, // Si viene con relación
  };
};

/**
 * Mapea un array de paralelos del backend al formato de lista
 * 
 * @param {Array} paralelosBackend - Array de paralelos desde el backend
 * @returns {Array} - Array de paralelos mapeados para la lista
 */
export const mapParalelosList = (paralelosBackend) => {
  if (!Array.isArray(paralelosBackend)) {
    return [];
  }

  return paralelosBackend.map(paraleloListMapper).filter(Boolean);
};
