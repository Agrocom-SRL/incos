import { Student } from '../../../domain/entities/Student.js';
import { ValidationError } from '../../../shared/errors/AppError.js';
import { StudentValidator } from '../../../shared/validators/StudentValidator.js';
import { StudentCodeUtils } from '../../../shared/utils/StudentCodeUtils.js';

/**
 * Use Case: RegisterStudentUseCase
 * Módulo: Estudiantes
 * Implementa el caso de uso básico: Registrar Estudiante Nuevo
 * 
 * Solo registra los datos básicos del estudiante (sin datos académicos, becas, etc.)
 */
export class RegisterStudentUseCase {
  constructor({
    studentRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {RegisterStudentDTO} dto - DTO con datos en castellano
   * @param {number} userId - ID del usuario que realiza la operación
   * @returns {Promise<Student>}
   */
  async execute(dto, userId) {
    this.logger.info('[Estudiantes] Iniciando registro de estudiante', { 
      ci: dto.ci, 
      expedicion: dto.expedicion 
    });

    // 1. Validar reglas de negocio (CI único, email único)
    await StudentValidator.validateBusinessRules(dto, this.studentRepository);

    // 2. Convertir DTO a datos de entidad
    const studentData = dto.toEntityData();

    // 3. Crear entidad de dominio
    const student = new Student(studentData);

    // 4. Validar edad mínima (17 años)
    if (!student.hasMinimumAge()) {
      throw new ValidationError('El estudiante debe tener al menos 17 años de edad');
    }

    // 5. Validar formato de CI
    if (!student.isValidCI()) {
      throw new ValidationError('El CI debe tener entre 7 y 9 dígitos');
    }

    // 6. Validar formato de expedición
    if (!student.isValidExpedition()) {
      throw new ValidationError('La expedición del CI es inválida');
    }

    // 7. Validar formato de email si se proporciona
    if (dto.emailPersonal && !student.isValidEmail()) {
      throw new ValidationError('El formato del email es inválido');
    }

    // 8. Generar código único de estudiante (temporal, se generará después con gestión)
    // TODO: Implementar generación de código con gestión cuando se agregue esa funcionalidad
    student.studentCode = StudentCodeUtils.generateTemporaryCode(dto.ci);

    // 9. Persistir estudiante
    const savedStudent = await this.studentRepository.create(student, userId);

    this.logger.info('[Estudiantes] Estudiante registrado exitosamente', {
      id: savedStudent.id,
      codigoEstudiante: savedStudent.studentCode,
    });

    return savedStudent;
  }
}

