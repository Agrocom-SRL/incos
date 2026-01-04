/**
 * Mapper de aplicación: Student
 * Convierte entidades de dominio (Student) a formato de presentación (API/Spanish)
 * 
 * Clean Architecture:
 * - Application Layer: Convierte Domain Entities → Presentation Format
 * - Depende de Domain Layer (Student entity)
 * 
 * Responsabilidades:
 * - Mapear propiedades de dominio (English/camelCase) a presentación (Spanish/snake_case)
 * - Formatear datos para consumo por el frontend
 * - Ocultar campos internos no necesarios en la API
 */

/**
 * Convierte una entidad Student a formato de presentación
 * @param {Student} student - Entidad de dominio Student
 * @returns {Object|null} Objeto en formato de presentación o null si student es null/undefined
 */
export function entityToPresentation(student) {
  if (!student) return null;

  return {
    id: student.id,
    usuarioId: student.userId,
    codigoEstudiante: student.studentCode,
    ci: student.ci,
    expedicion: student.expedition,
    nombres: student.firstName,
    apellidoPaterno: student.lastName,
    apellidoMaterno: student.motherLastName,
    fechaNacimiento: student.birthDate,
    genero: student.gender,
    estadoCivilId: student.civilStatusId,
    tipoSangre: student.bloodType,
    tieneDiscapacidad: student.hasDisability,
    emailPersonal: student.personalEmail,
    celular: student.mobilePhone,
    telefonoFijo: student.landlinePhone,
    direccion: student.address,
    municipioResidenciaId: student.residenceMunicipalityId,
    zona: student.zone,
    observaciones: student.observations,
    activo: student.active,
    createdAt: student.createdAt,
  };
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

