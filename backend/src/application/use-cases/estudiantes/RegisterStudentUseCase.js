import { Student } from '../../../domain/entities/Student.js';
import { StudentCodeGenerator } from '../../../domain/services/StudentCodeGenerator.js';
import { ValidationError, ConflictError } from '../../../shared/errors/AppError.js';

/**
 * Use Case: RegisterStudentUseCase
 * Implementa el caso de uso CU-001: Registrar Estudiante Nuevo
 */
export class RegisterStudentUseCase {
  constructor({
    studentRepository,
    gestionRepository,
    carreraRepository,
    becaDescuentoRepository,
    studentBecaRepository,
    academicDataRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.gestionRepository = gestionRepository;
    this.carreraRepository = carreraRepository;
    this.becaDescuentoRepository = becaDescuentoRepository;
    this.studentBecaRepository = studentBecaRepository;
    this.academicDataRepository = academicDataRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso
   * @param {RegisterStudentDTO} dto
   * @param {number} userId - ID del usuario que realiza la operación
   * @returns {Promise<Student>}
   */
  async execute(dto, userId) {
    this.logger.info('Iniciando registro de estudiante', { ci: dto.ci, expedicion: dto.expedicion });

    // 1. Validar CI único (RN-EST-001)
    const existingStudent = await this.studentRepository.findByCI(dto.ci, dto.expedicion);
    if (existingStudent) {
      throw new ConflictError(`Ya existe un estudiante con este CI: ${dto.ci}-${dto.expedicion}`);
    }

    // 2. Validar email único si se proporciona (RN-EST-003)
    if (dto.emailPersonal) {
      const existingByEmail = await this.studentRepository.findByEmail(dto.emailPersonal);
      if (existingByEmail) {
        throw new ConflictError(`Ya existe un estudiante con este email: ${dto.emailPersonal}`);
      }
    }

    // 3. Validar que la gestión existe
    const gestion = await this.gestionRepository.findById(dto.gestionIngresoId);
    if (!gestion) {
      throw new ValidationError('La gestión de ingreso especificada no existe');
    }

    // 4. Validar que la carrera existe
    const carrera = await this.carreraRepository.findById(dto.carreraId);
    if (!carrera) {
      throw new ValidationError('La carrera especificada no existe');
    }

    // 5. Crear entidad de dominio
    const studentData = dto.toPlainObject();
    const student = new Student(studentData);

    // 6. Validar edad mínima (17 años) - RN-EST-002
    if (!student.hasMinimumAge()) {
      throw new ValidationError('El estudiante debe tener al menos 17 años de edad');
    }

    // 7. Validar formato de CI
    if (!student.isValidCI()) {
      throw new ValidationError('El CI debe tener entre 7 y 9 dígitos');
    }

    // 8. Validar formato de expedición
    if (!student.isValidExpedicion()) {
      throw new ValidationError('La expedición del CI es inválida');
    }

    // 9. Generar código único de estudiante (EST-YYYY-NNNN)
    const siguienteNumero = await this.studentRepository.getNextStudentNumber(
      gestion.codigo
    );
    student.codigoEstudiante = StudentCodeGenerator.generate(
      gestion.codigo,
      siguienteNumero
    );

    // 10. Persistir estudiante
    const savedStudent = await this.studentRepository.create(student, userId);

    // 11. Crear datos académicos
    if (dto.carreraId || dto.gestionIngresoId) {
      await this.academicDataRepository.create(
        {
          estudianteId: savedStudent.id,
          carreraId: dto.carreraId,
          gestionIngresoId: dto.gestionIngresoId,
          estadoAcademico: 'REGULAR',
          unidadEducativaProcedencia: dto.unidadEducativaProcedencia,
          anioEgresoSecundaria: dto.anioEgresoSecundaria,
          promedioAnual: dto.promedioAnual,
        },
        userId
      );
    }

    // 12. Si tiene beca, asignarla
    if (dto.becaDescuentoId) {
      const becaDescuento = await this.becaDescuentoRepository.findById(dto.becaDescuentoId);
      if (!becaDescuento) {
        throw new ValidationError('La beca/descuento especificada no existe');
      }

      // Validar beca 100% requiere documentación (RN-EST-004)
      if (becaDescuento.porcentaje === 100) {
        // Aquí se validaría si hay documentos adjuntos
        // Por ahora solo registramos la beca como PENDIENTE si requiere aprobación
      }

      await this.studentBecaRepository.create(
        {
          estudianteId: savedStudent.id,
          becaDescuentoId: dto.becaDescuentoId,
          gestionId: dto.gestionIngresoId,
          fechaSolicitud: new Date(),
          estado: becaDescuento.porcentaje === 100 ? 'PENDIENTE' : 'ACTIVA',
          observaciones: dto.becaMotivo,
        },
        userId
      );
    }

    this.logger.info('Estudiante registrado exitosamente', {
      id: savedStudent.id,
      codigoEstudiante: savedStudent.codigoEstudiante,
    });

    return savedStudent;
  }
}
