/**
 * Mapper de aplicación: RelationshipType
 * Convierte entidades de dominio (RelationshipType) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (RelationshipType entity)
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad RelationshipType a formato de presentación
 * @param {RelationshipType} relationshipType - Entidad de dominio RelationshipType
 * @returns {Object|null} Objeto en formato de presentación o null si relationshipType es null/undefined
 */
export function entityToPresentation(relationshipType) {
  if (!relationshipType) return null;

  return {
    id: relationshipType.id,
    nombre: relationshipType.name,
    descripcion: relationshipType.description,
    activo: relationshipType.active,
    createdAt: relationshipType.createdAt,
  };
}

/**
 * Convierte un array de entidades RelationshipType a formato de presentación
 * @param {RelationshipType[]} relationshipTypes - Array de entidades de dominio RelationshipType
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(relationshipTypes) {
  if (!Array.isArray(relationshipTypes)) return [];
  return relationshipTypes.map(entityToPresentation);
}

/**
 * Clase mapper para RelationshipType (exportada por compatibilidad)
 */
export class RelationshipTypeMapper {
  static entityToPresentation(relationshipType) {
    return entityToPresentation(relationshipType);
  }

  static entitiesToPresentation(relationshipTypes) {
    return entitiesToPresentation(relationshipTypes);
  }
}
