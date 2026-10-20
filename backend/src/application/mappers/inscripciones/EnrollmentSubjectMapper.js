/**
 * Mapper de aplicación: EnrollmentSubject
 * Convierte entidades de dominio (EnrollmentSubject) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (EnrollmentSubject entity)
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad EnrollmentSubject a formato de presentación
 * @param {EnrollmentSubject} enrollmentSubject - Entidad de dominio EnrollmentSubject
 * @returns {Object|null} Objeto en formato de presentación o null si enrollmentSubject es null/undefined
 */
export function entityToPresentation(enrollmentSubject) {
  if (!enrollmentSubject) return null;

  return {
    id: enrollmentSubject.id,
    inscripcionId: enrollmentSubject.enrollmentId,
    ofertaCursoId: enrollmentSubject.offerCourseId,
    asignaturaPlanId: enrollmentSubject.curriculumSubjectId,
    notaFinal: enrollmentSubject.finalGrade,
    notaDefinitiva: enrollmentSubject.definitiveGrade,
    estado: enrollmentSubject.status,
    observaciones: enrollmentSubject.observations,
    observacionesDocente: enrollmentSubject.teacherObservations,
    activo: enrollmentSubject.active,
    createdAt: enrollmentSubject.createdAt,
    updatedAt: enrollmentSubject.updatedAt,
  };
}

/**
 * Convierte un array de entidades EnrollmentSubject a formato de presentación
 * @param {EnrollmentSubject[]} subjectEnrollments - Array de entidades de dominio EnrollmentSubject
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(subjectEnrollments) {
  if (!Array.isArray(subjectEnrollments)) return [];
  return subjectEnrollments.map(entityToPresentation);
}

/**
 * Clase mapper para EnrollmentSubject (exportada por compatibilidad)
 */
export class EnrollmentSubjectMapper {
  static entityToPresentation(enrollmentSubject) {
    return entityToPresentation(enrollmentSubject);
  }

  static entitiesToPresentation(subjectEnrollments) {
    return entitiesToPresentation(subjectEnrollments);
  }
}
