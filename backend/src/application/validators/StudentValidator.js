import { ConflictError, ValidationError } from '../../domain/errors/index.js';

/**
 * Validador de Estudiantes
 * Contiene validaciones de negocio que requieren acceso a repositorios
 * 
 * Ubicación: application/validators (capa de aplicación)
 * 
 * Este validador es un servicio de la capa de aplicación que:
 * - Depende del Domain Layer (errores) ✅ (dependencia hacia adentro)
 * - Requiere repositorios para validaciones de negocio
 * - Se inyecta en Use Cases mediante DI Container
 */
export class StudentValidator {
  /**
   * @param {Object} studentRepository - Repositorio de estudiantes inyectado
   */
  constructor({ studentRepository }) {
    this.studentRepository = studentRepository;
  }

  /**
   * Valida que el CI sea único en el sistema
   * @param {string} ci - Número de CI
   * @param {string} expedicion - Expedición del CI (castellano)
   * @throws {ConflictError} Si ya existe un estudiante con ese CI
   * @throws {ValidationError} Si CI o expedición no están presentes
   */
  async validateUniqueCI(ci, expedicion) {
    if (!ci || !expedicion) {
      throw new ValidationError('CI y expedición son requeridos');
    }

    // Convertir expedicion a expedition para la búsqueda en el repositorio
    const expedition = expedicion.toUpperCase();
    const existingStudent = await this.studentRepository.findByCI(ci, expedition);

    if (existingStudent) {
      throw new ConflictError(`Ya existe un estudiante con este CI: ${ci}-${expedicion}`);
    }
  }

  /**
   * Valida que el email sea único en el sistema (si se proporciona)
   * @param {string} email - Email a validar
   * @throws {ConflictError} Si ya existe un estudiante con ese email
   */
  async validateUniqueEmail(email) {
    if (!email) {
      return; // Email es opcional, no validar si no se proporciona
    }

    const emailLower = email.toLowerCase();
    const existingByEmail = await this.studentRepository.findByEmail(emailLower);

    if (existingByEmail) {
      throw new ConflictError(`Ya existe un estudiante con este email: ${email}`);
    }
  }

  /**
   * Valida todas las reglas de negocio que requieren repositorio
   * @param {Object} dto - DTO con datos del estudiante
   * @throws {ConflictError|ValidationError} Si alguna validación falla
   */
  async validateBusinessRules(dto) {
    // Validar CI único
    await this.validateUniqueCI(dto.ci, dto.expedicion);

    // Validar email único (si se proporciona)
    if (dto.emailPersonal) {
      await this.validateUniqueEmail(dto.emailPersonal);
    }
  }
}

export default StudentValidator;

