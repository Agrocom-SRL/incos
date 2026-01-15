/**
 * Mapper de aplicación: StudentAcademicData
 * Convierte entidades de dominio (StudentAcademicData) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (StudentAcademicData entity)
 * - Usa BaseMapper para campos comunes
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

import { BaseMapper } from '../base/index.js';

/**
 * Convierte una entidad StudentAcademicData a formato de presentación
 * Solo incluye campos que existen en la entidad (útil cuando se usan attributes limitados)
 * 
 * @param {StudentAcademicData} studentAcademicData - Entidad de dominio StudentAcademicData
 * @returns {Object|null} Objeto en formato de presentación o null si studentAcademicData es null/undefined
 */
export function entityToPresentation(studentAcademicData) {
  if (!studentAcademicData) return null;

  const presentation = {};
  
  // Mapear campos base comunes (id, active, createdAt, updatedAt)
  BaseMapper.mapBaseFields(studentAcademicData, presentation);
  
  // Mapear campos específicos de StudentAcademicData
  // Solo incluir campos que existen en la entidad (usando mapFieldIfExists)
  // Esto es importante cuando se usan attributes limitados en las consultas
  BaseMapper.mapFieldIfExists(studentAcademicData, 'studentId', 'estudianteId', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'careerId', 'carreraId', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'managementId', 'gestionId', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'academicState', 'estadoAcademico', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'registrationState', 'estadoRegistro', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'previousSchool', 'colegioAnterior', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'highSchoolGraduationYear', 'anioEgresoColegio', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'annualAverage', 'promedioAnual', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'graduationDate', 'fechaEgreso', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'withdrawalDate', 'fechaRetiro', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'withdrawalReason', 'motivoRetiro', presentation);
  BaseMapper.mapFieldIfExists(studentAcademicData, 'photoUrl', 'fotoUrl', presentation);

  return presentation;
}

/**
 * Convierte un array de entidades StudentAcademicData a formato de presentación
 * @param {StudentAcademicData[]} studentAcademicDataList - Array de entidades de dominio StudentAcademicData
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(studentAcademicDataList) {
  if (!Array.isArray(studentAcademicDataList)) return [];
  return studentAcademicDataList.map(entityToPresentation);
}

/**
 * Clase mapper para StudentAcademicData (exportada por compatibilidad)
 */
export class StudentAcademicDataMapper {
  static entityToPresentation(studentAcademicData) {
    return entityToPresentation(studentAcademicData);
  }

  static entitiesToPresentation(studentAcademicDataList) {
    return entitiesToPresentation(studentAcademicDataList);
  }
}
