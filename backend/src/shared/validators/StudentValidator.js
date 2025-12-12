import { ConflictError, ValidationError } from '../errors/AppError.js';

/**
 * Validador de Estudiantes
 * Contiene validaciones de negocio que requieren acceso a repositorios
 */
export class StudentValidator {
  /**
   * Valida que el CI sea único en el sistema
   * @param {string} ci - Número de CI
   * @param {string} expedicion - Expedición del CI (castellano)
   * @param {Object} studentRepository - Repositorio de estudiantes
   * @throws {ConflictError} Si ya existe un estudiante con ese CI
   */
  static async validateUniqueCI(ci, expedicion, studentRepository) {
    if (!ci || !expedicion) {
      throw new ValidationError('CI y expedición son requeridos');
    }

    // Convertir expedicion a expedition para la búsqueda en el repositorio
    const expedition = expedicion.toUpperCase();
    const existingStudent = await studentRepository.findByCI(ci, expedition);

    if (existingStudent) {
      throw new ConflictError(`Ya existe un estudiante con este CI: ${ci}-${expedicion}`);
    }
  }

  /**
   * Valida que el email sea único en el sistema (si se proporciona)
   * @param {string} email - Email a validar
   * @param {Object} studentRepository - Repositorio de estudiantes
   * @throws {ConflictError} Si ya existe un estudiante con ese email
   */
  static async validateUniqueEmail(email, studentRepository) {
    if (!email) {
      return; // Email es opcional, no validar si no se proporciona
    }

    const emailLower = email.toLowerCase();
    const existingByEmail = await studentRepository.findByEmail(emailLower);

    if (existingByEmail) {
      throw new ConflictError(`Ya existe un estudiante con este email: ${email}`);
    }
  }

  /**
   * Valida todas las reglas de negocio que requieren repositorio
   * @param {Object} dto - DTO con datos del estudiante
   * @param {Object} studentRepository - Repositorio de estudiantes
   * @throws {ConflictError|ValidationError} Si alguna validación falla
   */
  static async validateBusinessRules(dto, studentRepository) {
    // Validar CI único
    await this.validateUniqueCI(dto.ci, dto.expedicion, studentRepository);

    // Validar email único (si se proporciona)
    if (dto.emailPersonal) {
      await this.validateUniqueEmail(dto.emailPersonal, studentRepository);
    }
  }
}

export default StudentValidator;

