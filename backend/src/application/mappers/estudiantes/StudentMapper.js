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
  BaseMapper.mapFieldIfExists(student, 'works', 'trabaja', presentation);
  BaseMapper.mapFieldIfExists(student, 'employerInstitution', 'empresaInstitucion', presentation);
  BaseMapper.mapFieldIfExists(student, 'position', 'cargo', presentation);
  BaseMapper.mapFieldIfExists(student, 'observations', 'observaciones', presentation);

  return presentation;
}

/**
 * Convierte una fila de vista_estudiante_datos_personales (snake_case) a formato de presentación.
 * Usado por ListStudentsUseCase cuando lista desde la vista.
 *
 * @param {Object} row - Fila plana de la vista (snake_case)
 * @returns {Object|null} Objeto en formato de presentación o null si row es null/undefined
 */
export function viewRowToPresentation(row) {
  if (!row) return null;

  const presentation = {};
  const map = (src, dest) => {
    if (row[src] !== undefined && row[src] !== null) presentation[dest] = row[src];
  };

  map('id', 'id');
  map('activo', 'activo');
  map('created_at', 'createdAt');
  map('updated_at', 'updatedAt');
  map('usuario_id', 'usuarioId');
  map('codigo_estudiante', 'codigoEstudiante');
  map('ci', 'ci');
  map('expedicion', 'expedicion');
  map('nombres', 'nombres');
  map('apellido_paterno', 'apellidoPaterno');
  map('apellido_materno', 'apellidoMaterno');
  map('fecha_nacimiento', 'fechaNacimiento');
  map('genero', 'genero');
  map('estado_civil_id', 'estadoCivilId');
  map('tipo_sangre', 'tipoSangre');
  map('tiene_discapacidad', 'tieneDiscapacidad');
  map('email_personal', 'emailPersonal');
  map('celular', 'celular');
  map('telefono_fijo', 'telefonoFijo');
  map('direccion', 'direccion');
  map('municipio_residencia_id', 'municipioResidenciaId');
  map('zona', 'zona');
  presentation.trabaja = row.trabaja === 1 || row.trabaja === true;
  map('empresa_institucion', 'empresaInstitucion');
  map('cargo', 'cargo');
  map('observaciones', 'observaciones');
  if (row.residencia_municipio_nombre !== undefined) {
    presentation.residenciaMunicipioNombre = row.residencia_municipio_nombre;
  }
  if (row.residencia_provincia_nombre !== undefined) {
    presentation.residenciaProvinciaNombre = row.residencia_provincia_nombre;
  }
  if (row.residencia_departamento_nombre !== undefined) {
    presentation.residenciaDepartamentoNombre = row.residencia_departamento_nombre;
  }
  if (row.estado_civil_nombre !== undefined) presentation.estadoCivilNombre = row.estado_civil_nombre;

  return presentation;
}

/**
 * Convierte un array de filas de la vista a formato de presentación.
 * @param {Object[]} rows - Array de filas de vista_estudiante_datos_personales
 * @returns {Object[]} Array de objetos en formato de presentación
 */
export function viewRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(viewRowToPresentation).filter(Boolean);
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

  static viewRowToPresentation(row) {
    return viewRowToPresentation(row);
  }

  static viewRowsToPresentation(rows) {
    return viewRowsToPresentation(rows);
  }
}
