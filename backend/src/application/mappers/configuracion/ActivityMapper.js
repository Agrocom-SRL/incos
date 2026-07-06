/**
 * Mapper de aplicación: Activity
 * Convierte entidades de dominio (Activity) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Activity entity)
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 */

/**
 * Convierte una entidad Activity a formato de presentación
 * @param {Activity} activity - Entidad de dominio Activity
 * @returns {Object|null} Objeto en formato de presentación o null si activity es null/undefined
 */
export function entityToPresentation(activity) {
  if (!activity) return null;

  return {
    id: activity.id,
    nombre: activity.name,
    descripcion: activity.description,
    tipo: activity.type,
    esDestacada: activity.isHighlighted,
    icono: activity.icon,
    activo: activity.active,
    createdAt: activity.createdAt,
  };
}

/**
 * Convierte un array de entidades Activity a formato de presentación
 * @param {Activity[]} activities - Array de entidades de dominio Activity
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(activities) {
  if (!Array.isArray(activities)) return [];
  return activities.map(entityToPresentation);
}

/**
 * Clase mapper para Activity (exportada por compatibilidad con BaseListUseCase)
 */
export class ActivityMapper {
  static entityToPresentation(activity) {
    return entityToPresentation(activity);
  }

  static entitiesToPresentation(activities) {
    return entitiesToPresentation(activities);
  }
}
