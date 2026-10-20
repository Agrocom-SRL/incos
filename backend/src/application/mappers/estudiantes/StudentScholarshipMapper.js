/**
 * Mapper de aplicación: StudentScholarship
 * Convierte entidades de dominio (StudentScholarship) a formato de presentación (API/Spanish)
 *
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (StudentScholarship entity)
 * - Usa BaseMapper para campos comunes
 *
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

import { BaseMapper } from '../base/index.js';

/**
 * Convierte una entidad StudentScholarship a formato de presentación
 * Solo incluye campos que existen en la entidad (útil cuando se usan attributes limitados)
 *
 * @param {StudentScholarship} studentScholarship - Entidad de dominio StudentScholarship
 * @returns {Object|null} Objeto en formato de presentación o null si studentScholarship es null/undefined
 */
export function entityToPresentation(studentScholarship) {
  if (!studentScholarship) return null;

  const presentation = {};

  // Mapear campos base comunes (id, active, createdAt, updatedAt)
  BaseMapper.mapBaseFields(studentScholarship, presentation);

  // Mapear campos específicos de StudentScholarship
  // Solo incluir campos que existen en la entidad (usando mapFieldIfExists)
  // Esto es importante cuando se usan attributes limitados en las consultas
  BaseMapper.mapFieldIfExists(studentScholarship, 'studentId', 'estudianteId', presentation);
  BaseMapper.mapFieldIfExists(studentScholarship, 'scholarshipId', 'becaDescuentoId', presentation);
  BaseMapper.mapFieldIfExists(studentScholarship, 'managementId', 'gestionId', presentation);
  BaseMapper.mapFieldIfExists(studentScholarship, 'requestDate', 'fechaSolicitud', presentation);
  BaseMapper.mapFieldIfExists(studentScholarship, 'state', 'estado', presentation);
  BaseMapper.mapFieldIfExists(studentScholarship, 'documentsComplete', 'documentosCompletos', presentation);
  BaseMapper.mapFieldIfExists(studentScholarship, 'documentDeliveryStartDate', 'fechaInicioEntregaDocumentos', presentation);
  BaseMapper.mapFieldIfExists(studentScholarship, 'documentDeliveryEndDate', 'fechaFinEntregaDocumentos', presentation);
  BaseMapper.mapFieldIfExists(studentScholarship, 'observations', 'observaciones', presentation);

  return presentation;
}

/**
 * Convierte un array de entidades StudentScholarship a formato de presentación
 * @param {StudentScholarship[]} studentScholarships - Array de entidades de dominio StudentScholarship
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(studentScholarships) {
  if (!Array.isArray(studentScholarships)) return [];
  return studentScholarships.map(entityToPresentation);
}

/**
 * Clase mapper para StudentScholarship (exportada por compatibilidad)
 */
export class StudentScholarshipMapper {
  static entityToPresentation(studentScholarship) {
    return entityToPresentation(studentScholarship);
  }

  static entitiesToPresentation(studentScholarships) {
    return entitiesToPresentation(studentScholarships);
  }
}
