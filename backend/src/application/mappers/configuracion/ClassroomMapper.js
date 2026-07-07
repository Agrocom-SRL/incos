/**
 * Mapper de aplicación: Classroom
 * Convierte entidades de dominio (Classroom) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Classroom entity)
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 */

/**
 * Convierte una entidad Classroom a formato de presentación
 * @param {Classroom} classroom - Entidad de dominio Classroom
 * @returns {Object|null} Objeto en formato de presentación o null si classroom es null/undefined
 */
export function entityToPresentation(classroom) {
  if (!classroom) return null;

  return {
    id: classroom.id,
    codigo: classroom.code,
    nombre: classroom.name,
    categoria: classroom.category,
    capacidad: classroom.capacity,
    observaciones: classroom.observations ?? null,
    activo: classroom.active,
    createdAt: classroom.createdAt,
  };
}

/**
 * Convierte un array de entidades Classroom a formato de presentación
 * @param {Classroom[]} classrooms - Array de entidades de dominio Classroom
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(classrooms) {
  if (!Array.isArray(classrooms)) return [];
  return classrooms.map(entityToPresentation);
}

/**
 * Clase mapper para Classroom (exportada por compatibilidad con el patrón del módulo)
 */
export class ClassroomMapper {
  static entityToPresentation(classroom) {
    return entityToPresentation(classroom);
  }

  static entitiesToPresentation(classrooms) {
    return entitiesToPresentation(classrooms);
  }
}
