/**
 * Mapper de aplicación: Enrollment
 * Convierte entidades de dominio (Enrollment) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Enrollment entity)
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad Enrollment a formato de presentación
 * @param {Enrollment} enrollment - Entidad de dominio Enrollment
 * @returns {Object|null} Objeto en formato de presentación o null si enrollment es null/undefined
 */
export function entityToPresentation(enrollment) {
  if (!enrollment) return null;

  return {
    id: enrollment.id,
    estudianteDatosAcademicosId: enrollment.studentAcademicDataId,
    gestionId: enrollment.managementId,
    tipoInscripcion: enrollment.enrollmentType,
    fechaInscripcion: enrollment.enrollmentDate,
    observaciones: enrollment.observations,
    activo: enrollment.active,
    createdAt: enrollment.createdAt,
    updatedAt: enrollment.updatedAt,
  };
}

/**
 * Convierte un array de entidades Enrollment a formato de presentación
 * @param {Enrollment[]} enrollments - Array de entidades de dominio Enrollment
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(enrollments) {
  if (!Array.isArray(enrollments)) return [];
  return enrollments.map(entityToPresentation);
}

/**
 * Clase mapper para Enrollment (exportada por compatibilidad)
 */
export class EnrollmentMapper {
  static entityToPresentation(enrollment) {
    return entityToPresentation(enrollment);
  }

  static entitiesToPresentation(enrollments) {
    return entitiesToPresentation(enrollments);
  }
}
