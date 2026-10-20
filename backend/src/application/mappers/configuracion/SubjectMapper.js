/**
 * Mapper de aplicación: Subject
 * Convierte entidades de dominio (Subject) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Subject entity)
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad Subject a formato de presentación
 * @param {Subject} subject - Entidad de dominio Subject
 * @returns {Object|null} Objeto en formato de presentación o null si subject es null/undefined
 */
export function entityToPresentation(subject) {
  if (!subject) return null;

  return {
    id: subject.id,
    sigla: subject.acronym,
    nombre: subject.name,
    objetivos: subject.objectives,
    clasificacion: subject.classification,
    tipo: subject.type,
    activo: subject.active,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
}

/**
 * Convierte un array de entidades Subject a formato de presentación
 * @param {Subject[]} subjects - Array de entidades de dominio Subject
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(subjects) {
  if (!Array.isArray(subjects)) return [];
  return subjects.map(entityToPresentation);
}

/**
 * Clase mapper para Subject (exportada por compatibilidad)
 */
export class SubjectMapper {
  static entityToPresentation(subject) {
    return entityToPresentation(subject);
  }

  static entitiesToPresentation(subjects) {
    return entitiesToPresentation(subjects);
  }
}
