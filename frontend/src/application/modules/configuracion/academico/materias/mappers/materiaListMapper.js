/**
 * Mapper: materiaListMapper
 * 
 * Single Responsibility: Transformar datos del backend al formato necesario para la lista
 * 
 * Mapea los datos completos de la materia a un formato simplificado
 * para la visualización en la lista de materias.
 * 
 * NOTA: El backend devuelve entidades Subject con propiedades en inglés (camelCase):
 * - code, name, shortName, type, theoreticalHours, practicalHours, credits
 * 
 * Ubicación: application/modules/configuracion/academico/materias/mappers
 * 
 * @param {Object} materiaBackend - Datos de la materia desde el backend (en inglés)
 * @returns {Object} - Datos mapeados para la lista (en español/camelCase)
 */
export const materiaListMapper = (materiaBackend) => {
  if (!materiaBackend) {
    return null;
  }

  // Calcular carga horaria total si no viene directamente
  const cargaHorariaTotal = materiaBackend.totalHours || 
    ((materiaBackend.theoreticalHours || 0) + (materiaBackend.practicalHours || 0));

  return {
    id: materiaBackend.id,
    codigo: materiaBackend.code,
    nombre: materiaBackend.name,
    nombreCorto: materiaBackend.shortName,
    cargaHorariaTotal: cargaHorariaTotal,
    tipo: materiaBackend.type, // 'TEORICA', 'PRACTICA', 'TEORICA_PRACTICA'
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

