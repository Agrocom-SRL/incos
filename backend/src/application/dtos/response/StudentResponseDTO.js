import { StudentMapper } from '../../mappers/StudentMapper.js';

/**
 * DTO: StudentResponseDTO
 * Data Transfer Object para respuestas de estudiantes
 * Convierte datos de la entidad (inglés) a formato de presentación (castellano)
 */
export class StudentResponseDTO {
  constructor(data) {
    // El DTO contiene datos en castellano para la respuesta
    Object.assign(this, data);
  }

  /**
   * Crea un DTO desde una entidad Student (usa el mapper para convertir a castellano)
   * @param {Student} student - Entidad Student con nombres en inglés
   * @returns {StudentResponseDTO}
   */
  static fromEntity(student) {
    // Usa el mapper para convertir de inglés (dominio) a castellano (presentación)
    const data = StudentMapper.entityToPresentation(student);
    return new StudentResponseDTO(data);
  }

  /**
   * Crea un array de DTOs desde un array de entidades
   * @param {Student[]} students - Array de entidades Student
   * @returns {StudentResponseDTO[]}
   */
  static fromEntities(students) {
    return StudentMapper.entitiesToPresentation(students).map(
      (data) => new StudentResponseDTO(data)
    );
  }
}
