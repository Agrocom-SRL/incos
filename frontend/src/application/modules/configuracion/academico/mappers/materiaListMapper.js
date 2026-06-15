/**
 * Mapper: materiaListMapper
 * 
 * Single Responsibility: Transformar datos del backend al formato necesario para la lista
 * 
 * Mapea los datos completos de la materia a un formato simplificado
 * para la visualización en la lista de materias.
 * 
 * NOTA: El backend devuelve entidades Subject con propiedades en español (camelCase):
 * - sigla, nombre, objetivos, clasificacion, tipo
 * 
 * Ubicación: application/modules/configuracion/academico/mappers
 * 
 * @param {Object} materiaBackend - Datos de la materia desde el backend (en español)
 * @returns {Object} - Datos mapeados para la lista (en español/camelCase)
 */
export const materiaListMapper = (materiaBackend) => {
  if (!materiaBackend) {
    return null;
  }

  return {
    id: materiaBackend.id,
    sigla: materiaBackend.sigla,
    nombre: materiaBackend.nombre,
    objetivos: materiaBackend.objetivos,
    clasificacion: materiaBackend.clasificacion,
    tipo: materiaBackend.tipo, // 'TEORICA', 'PRACTICA', 'TEORICA_PRACTICA'
    activo: materiaBackend.activo !== false,
  };
};

/**
 * Mapea un array de materias del backend al formato de lista
 * 
 * @param {Array} materiasBackend - Array de materias desde el backend
 * @returns {Array} - Array de materias mapeadas para la lista
 */
export const mapMateriasList = (materiasBackend) => {
  if (!Array.isArray(materiasBackend)) {
    return [];
  }

  return materiasBackend.map(materiaListMapper).filter(Boolean);
};

