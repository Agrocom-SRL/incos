/**
 * Mapper de aplicación: Career
 * Convierte entidades de dominio (Career) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Career entity)
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad Career a formato de presentación
 * @param {Career} career - Entidad de dominio Career
 * @returns {Object|null} Objeto en formato de presentación o null si career es null/undefined
 */
export function entityToPresentation(career) {
  if (!career) return null;

  return {
    id: career.id,
    codigo: career.code,
    nombre: career.name,
    descripcion: career.description,
    areaFormacion: career.trainingArea,
    tituloOtorgado: career.grantedTitle,
    colorHex: career.colorHex,
    imagenRuta: career.imagePath,
    activo: career.active,
    createdAt: career.createdAt,
    updatedAt: career.updatedAt,
  };
}

/**
 * Convierte un array de entidades Career a formato de presentación
 * @param {Career[]} careers - Array de entidades de dominio Career
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(careers) {
  if (!Array.isArray(careers)) return [];
  return careers.map(entityToPresentation);
}

/**
 * Clase mapper para Career (exportada por compatibilidad)
 */
export class CareerMapper {
  static entityToPresentation(career) {
    return entityToPresentation(career);
  }

  static entitiesToPresentation(careers) {
    return entitiesToPresentation(careers);
  }
}

