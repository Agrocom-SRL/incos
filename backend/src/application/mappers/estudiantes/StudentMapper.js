/**
 * Mapper de aplicación: Student
 * Convierte entidades de dominio (Student) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Student entity)
 * - Usa BaseMapper para campos comunes
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

import { BaseMapper } from '../base/index.js';

/**
 * Convierte una entidad Student a formato de presentación
 * Solo incluye campos que existen en la entidad (útil cuando se usan attributes limitados)
 * 
 * @param {Student} student - Entidad de dominio Student
 * @returns {Object|null} Objeto en formato de presentación o null si student es null/undefined
 */
export function entityToPresentation(student) {
  if (!student) return null;

  const presentation = {};
  
  // Mapear campos base comunes (id, active, createdAt, updatedAt)
  BaseMapper.mapBaseFields(student, presentation);
  
  // Mapear campos específicos de Student
  // Solo incluir campos que existen en la entidad (usando mapFieldIfExists)
  // Esto es importante cuando se usan attributes limitados en las consultas
  BaseMapper.mapFieldIfExists(student, 'userId', 'usuarioId', presentation);
  BaseMapper.mapFieldIfExists(student, 'studentCode', 'codigoEstudiante', presentation);
  BaseMapper.mapFieldIfExists(student, 'ci', 'ci', presentation);
  BaseMapper.mapFieldIfExists(student, 'expedition', 'expedicion', presentation);
  BaseMapper.mapFieldIfExists(student, 'firstName', 'nombres', presentation);
  BaseMapper.mapFieldIfExists(student, 'lastName', 'apellidoPaterno', presentation);
  BaseMapper.mapFieldIfExists(student, 'motherLastName', 'apellidoMaterno', presentation);
  BaseMapper.mapFieldIfExists(student, 'birthDate', 'fechaNacimiento', presentation);
  BaseMapper.mapFieldIfExists(student, 'gender', 'genero', presentation);
  BaseMapper.mapFieldIfExists(student, 'civilStatusId', 'estadoCivilId', presentation);
  BaseMapper.mapFieldIfExists(student, 'bloodType', 'tipoSangre', presentation);
  BaseMapper.mapFieldIfExists(student, 'hasDisability', 'tieneDiscapacidad', presentation);
  BaseMapper.mapFieldIfExists(student, 'personalEmail', 'emailPersonal', presentation);
  BaseMapper.mapFieldIfExists(student, 'mobilePhone', 'celular', presentation);
  BaseMapper.mapFieldIfExists(student, 'landlinePhone', 'telefonoFijo', presentation);
  BaseMapper.mapFieldIfExists(student, 'address', 'direccion', presentation);
  BaseMapper.mapFieldIfExists(student, 'residenceMunicipalityId', 'municipioResidenciaId', presentation);
  BaseMapper.mapFieldIfExists(student, 'zone', 'zona', presentation);
  BaseMapper.mapFieldIfExists(student, 'observations', 'observaciones', presentation);

  return presentation;
}

/**
 * Convierte un array de entidades Student a formato de presentación
 * @param {Student[]} students - Array de entidades de dominio Student
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function entitiesToPresentation(students) {
  if (!Array.isArray(students)) return [];
  return students.map(entityToPresentation);
}

/**
 * Clase mapper para Student (exportada por compatibilidad)
 */
export class StudentMapper {
  static entityToPresentation(student) {
    return entityToPresentation(student);
  }

  static entitiesToPresentation(students) {
    return entitiesToPresentation(students);
  }
}

