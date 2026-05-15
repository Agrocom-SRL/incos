/**
 * Mapper de aplicación: Enrollment
 * Convierte entidades de dominio (Enrollment) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Enrollment entity)
 * - Usa BaseMapper para campos comunes
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

import { BaseMapper } from '../base/index.js';

/**
 * Convierte una entidad Enrollment a formato de presentación
 * Solo incluye campos que existen en la entidad (útil cuando se usan attributes limitados)
 * 
 * @param {Enrollment} enrollment - Entidad de dominio Enrollment
 * @returns {Object|null} Objeto en formato de presentación o null si enrollment es null/undefined
 */
export function entityToPresentation(enrollment) {
  if (!enrollment) return null;

  const presentation = {};
  
  // Mapear campos base comunes (id, active, createdAt, updatedAt)
  BaseMapper.mapBaseFields(enrollment, presentation);
  
  // Mapear campos específicos de Enrollment
  // Solo incluir campos que existen en la entidad (usando mapFieldIfExists)
  // Esto es importante cuando se usan attributes limitados en las consultas
  BaseMapper.mapFieldIfExists(enrollment, 'academicDataId', 'datosAcademicosId', presentation);
  BaseMapper.mapFieldIfExists(enrollment, 'managementId', 'gestionId', presentation);
  BaseMapper.mapFieldIfExists(enrollment, 'enrollmentType', 'tipoInscripcion', presentation);
  BaseMapper.mapFieldIfExists(enrollment, 'enrollmentDate', 'fechaInscripcion', presentation);
  BaseMapper.mapFieldIfExists(enrollment, 'observations', 'observaciones', presentation);

  return presentation;
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
