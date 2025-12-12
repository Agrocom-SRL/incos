/**
 * Use Case: Crear Estudiante
 * 
 * Single Responsibility: Solo se encarga de crear un estudiante
 * Dependency Inversion: Depende de la abstracción IStudentRepository
 */

import { Student } from '@entities/Student';

export class CreateStudentUseCase {
  /**
   * @param {IStudentRepository} studentRepository - Repositorio de estudiantes
   */
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  /**
   * Ejecuta el caso de uso de crear estudiante
   * @param {Object} studentData - Datos del estudiante
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Object}>}
   */
  async execute(studentData) {
    try {
      // Crear entidad Student
      const student = new Student(studentData);

      // Validar entidad
      const validation = student.validate();
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Error de validación',
          validationErrors: validation.errors.reduce((acc, error, index) => {
            // Mapear errores a campos si es posible
            // Por ahora, retornamos errores generales
            acc[`error_${index}`] = error;
            return acc;
          }, {}),
        };
      }

      // Convertir a objeto plano para enviar al repositorio
      // Solo incluir datos básicos (sin académicos ni becas) según RegisterStudentDTO del backend
      const plainData = student.toPlainObject(false);

      // Remover campos undefined/null/vacíos
      Object.keys(plainData).forEach((key) => {
        if (plainData[key] === undefined || plainData[key] === null || plainData[key] === '') {
          delete plainData[key];
        }
      });

      // Llamar al repositorio
      const result = await this.studentRepository.create(plainData);

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error inesperado al crear el estudiante',
      };
    }
  }
}

