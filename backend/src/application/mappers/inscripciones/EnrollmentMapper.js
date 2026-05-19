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
 * Convierte una fila de vista_base_matricula_resumen_inscripcion a formato de presentación.
 * @param {Object} row - Fila de la vista (snake_case)
 * @returns {Object|null}
 */
export function viewRowToPresentation(row) {
  if (!row) return null;

  const presentation = {};

  BaseMapper.mapFieldIfExists(row, 'id', 'id', presentation);
  BaseMapper.mapFieldIfExists(row, 'inscripcion_id', 'id', presentation);
  BaseMapper.mapFieldIfExists(row, 'datos_academicos_id', 'datosAcademicosId', presentation);
  BaseMapper.mapFieldIfExists(row, 'gestion_id', 'gestionId', presentation);
  BaseMapper.mapFieldIfExists(row, 'tipo_inscripcion', 'tipoInscripcion', presentation);
  BaseMapper.mapFieldIfExists(row, 'fecha_inscripcion', 'fechaInscripcion', presentation);
  BaseMapper.mapFieldIfExists(row, 'cantidad_materias', 'cantidadMaterias', presentation);
  BaseMapper.mapFieldIfExists(row, 'cantidad_historial_previo', 'cantidadHistorialPrevio', presentation);
  BaseMapper.mapFieldIfExists(row, 'requiere_historial_previo', 'requiereHistorialPrevio', presentation);
  BaseMapper.mapFieldIfExists(row, 'historial_previo_estado', 'historialPrevioEstado', presentation);
  BaseMapper.mapFieldIfExists(row, 'activo', 'activo', presentation);
  BaseMapper.mapFieldIfExists(row, 'created_at', 'createdAt', presentation);
  BaseMapper.mapFieldIfExists(row, 'updated_at', 'updatedAt', presentation);

  const estudiante = {};
  BaseMapper.mapFieldIfExists(row, 'estudiante_id', 'id', estudiante);
  BaseMapper.mapFieldIfExists(row, 'estudiante_nombre_completo', 'nombreCompleto', estudiante);
  BaseMapper.mapFieldIfExists(row, 'estudiante_nombres', 'nombre', estudiante);
  BaseMapper.mapFieldIfExists(row, 'estudiante_apellido_paterno', 'apellidoPaterno', estudiante);
  BaseMapper.mapFieldIfExists(row, 'estudiante_apellido_materno', 'apellidoMaterno', estudiante);
  BaseMapper.mapFieldIfExists(row, 'codigo_estudiante', 'codigoEstudiante', estudiante);
  BaseMapper.mapFieldIfExists(row, 'estudiante_ci', 'ci', estudiante);
  BaseMapper.mapFieldIfExists(row, 'estudiante_expedicion', 'expedicion', estudiante);
  presentation.estudiante = estudiante;

  const carrera = {};
  BaseMapper.mapFieldIfExists(row, 'carrera_id', 'id', carrera);
  BaseMapper.mapFieldIfExists(row, 'carrera_codigo', 'codigo', carrera);
  BaseMapper.mapFieldIfExists(row, 'carrera_nombre', 'nombre', carrera);
  presentation.carrera = carrera;

  const gestion = {};
  BaseMapper.mapFieldIfExists(row, 'gestion_id', 'id', gestion);
  BaseMapper.mapFieldIfExists(row, 'gestion_nombre', 'nombre', gestion);
  BaseMapper.mapFieldIfExists(row, 'gestion_anio', 'anio', gestion);
  presentation.gestion = gestion;

  BaseMapper.mapFieldIfExists(row, 'paralelo_id', 'paraleloId', presentation);
  BaseMapper.mapFieldIfExists(row, 'periodo_id', 'periodoId', presentation);
  BaseMapper.mapFieldIfExists(row, 'periodo_numero', 'periodoNumero', presentation);

  const paralelo = {};
  BaseMapper.mapFieldIfExists(row, 'paralelo_id', 'id', paralelo);
  BaseMapper.mapFieldIfExists(row, 'paralelo_nombre', 'nombre', paralelo);
  BaseMapper.mapFieldIfExists(row, 'paralelo_turno', 'turno', paralelo);
  BaseMapper.mapFieldIfExists(row, 'paralelo_descripcion', 'descripcion', paralelo);
  presentation.paralelo = Object.keys(paralelo).length > 0 ? paralelo : null;

  const periodo = {};
  BaseMapper.mapFieldIfExists(row, 'periodo_id', 'id', periodo);
  BaseMapper.mapFieldIfExists(row, 'periodo_numero', 'numero', periodo);
  BaseMapper.mapFieldIfExists(row, 'periodo_nombre', 'nombre', periodo);
  presentation.periodo = Object.keys(periodo).length > 0 ? periodo : null;

  return presentation;
}

/**
 * @param {Object[]} rows
 * @returns {Object[]}
 */
export function viewRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(viewRowToPresentation).filter(Boolean);
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

  static viewRowToPresentation(row) {
    return viewRowToPresentation(row);
  }

  static viewRowsToPresentation(rows) {
    return viewRowsToPresentation(rows);
  }
}
