/**
 * Mapper de aplicación: CivilStatus
 * Convierte entidades de dominio (CivilStatus) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (CivilStatus entity)
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad CivilStatus a formato de presentación
 * @param {CivilStatus} civilStatus - Entidad de dominio CivilStatus
 * @returns {Object|null} Objeto en formato de presentación o null si civilStatus es null/undefined
 */
export function entityToPresentation(civilStatus) {
  if (!civilStatus) return null;

  return {
    id: civilStatus.id,
    nombre: civilStatus.name,
    abreviatura: civilStatus.abbreviation,
    activo: civilStatus.active,
    createdAt: civilStatus.createdAt,
  };
}

/**
 * Convierte un array de entidades CivilStatus a formato de presentación
 * @param {CivilStatus[]} civilStatuses - Array de entidades de dominio CivilStatus
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(civilStatuses) {
  if (!Array.isArray(civilStatuses)) return [];
  return civilStatuses.map(entityToPresentation);
}

/**
 * Clase mapper para CivilStatus (exportada por compatibilidad)
 */
export class CivilStatusMapper {
  static entityToPresentation(civilStatus) {
    return entityToPresentation(civilStatus);
  }

  static entitiesToPresentation(civilStatuses) {
    return entitiesToPresentation(civilStatuses);
  }
}
