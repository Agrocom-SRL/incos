/**
 * Mapper de aplicación: DisabilityType
 * Convierte entidades de dominio (DisabilityType) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (DisabilityType entity)
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad DisabilityType a formato de presentación
 * @param {DisabilityType} disabilityType - Entidad de dominio DisabilityType
 * @returns {Object|null} Objeto en formato de presentación o null si disabilityType es null/undefined
 */
export function entityToPresentation(disabilityType) {
  if (!disabilityType) return null;

  return {
    id: disabilityType.id,
    nombre: disabilityType.name,
    descripcion: disabilityType.description,
    activo: disabilityType.active,
    createdAt: disabilityType.createdAt,
  };
}

/**
 * Convierte un array de entidades DisabilityType a formato de presentación
 * @param {DisabilityType[]} disabilityTypes - Array de entidades de dominio DisabilityType
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(disabilityTypes) {
  if (!Array.isArray(disabilityTypes)) return [];
  return disabilityTypes.map(entityToPresentation);
}

/**
 * Clase mapper para DisabilityType (exportada por compatibilidad)
 */
export class DisabilityTypeMapper {
  static entityToPresentation(disabilityType) {
    return entityToPresentation(disabilityType);
  }

  static entitiesToPresentation(disabilityTypes) {
    return entitiesToPresentation(disabilityTypes);
  }
}
