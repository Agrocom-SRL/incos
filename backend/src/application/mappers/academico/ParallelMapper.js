/**
 * Mapper de aplicación: Parallel
 * Convierte entidades de dominio (Parallel) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Parallel entity)
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad Parallel a formato de presentación
 * @param {Parallel} parallel - Entidad de dominio Parallel
 * @returns {Object|null} Objeto en formato de presentación o null si parallel es null/undefined
 */
export function entityToPresentation(parallel) {
  if (!parallel) return null;

  return {
    id: parallel.id,
    carreraId: parallel.careerId,
    periodoId: parallel.periodId,
    nombre: parallel.name,
    turno: parallel.shift,
    descripcion: parallel.description,
    activo: parallel.active,
    createdAt: parallel.createdAt,
    updatedAt: parallel.updatedAt,
  };
}

/**
 * Convierte un array de entidades Parallel a formato de presentación
 * @param {Parallel[]} parallels - Array de entidades de dominio Parallel
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(parallels) {
  if (!Array.isArray(parallels)) return [];
  return parallels.map(entityToPresentation);
}

/**
 * Clase mapper para Parallel (exportada por compatibilidad)
 */
export class ParallelMapper {
  static entityToPresentation(parallel) {
    return entityToPresentation(parallel);
  }

  static entitiesToPresentation(parallels) {
    return entitiesToPresentation(parallels);
  }
}
