/**
 * Use Case: GetEnrollmentByIdUseCase
 * Módulo: Inscripciones
 * Obtiene una inscripción por ID con todos sus datos relacionados
 * 
 * Responsabilidades:
 * - Validar que la inscripción exista
 * - Obtener la inscripción principal
 * - Obtener materias inscritas (múltiples)
 * - Obtener datos relacionados (estudiante, gestión, etc.)
 * - Retornar la inscripción con todos sus datos relacionados
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la obtención completa de inscripciones
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

export class GetEnrollmentByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} params.enrollmentSubjectRepository - Repositorio de materias inscritas
   * @param {Object} params.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    enrollmentRepository,
    enrollmentSubjectRepository,
    studentAcademicDataRepository,
    managementRepository,
    logger,
  }) {
    this.enrollmentRepository = enrollmentRepository;
    this.enrollmentSubjectRepository = enrollmentSubjectRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de obtención de inscripción por ID
   * 
   * @param {number} enrollmentId - ID de la inscripción a obtener
   * @returns {Promise<Object>} Inscripción con todos sus datos relacionados
   */
  async execute(enrollmentId) {
    this.logger.info('[Inscripciones] Iniciando obtención de inscripción por ID', {
      enrollmentId,
    });

    try {
      // 1. Obtener la inscripción principal
      const enrollment = await this.enrollmentRepository.findById(enrollmentId);

      if (!enrollment) {
        throw new Error(`No se encontró una inscripción con ID ${enrollmentId}`);
      }

      this.logger.info('[Inscripciones] Inscripción encontrada', {
        enrollmentId: enrollment.id,
        studentAcademicDataId: enrollment.studentAcademicDataId,
        managementId: enrollment.managementId,
      });

      // 2. Obtener materias inscritas (múltiples)
      const enrollmentSubjectsResult = await this.enrollmentSubjectRepository.findAll(
        { enrollmentId: enrollment.id },
        null,
        null
      );
      const enrollmentSubjects = enrollmentSubjectsResult.enrollmentSubjects || [];

      this.logger.info('[Inscripciones] Materias inscritas encontradas', {
        enrollmentId: enrollment.id,
        count: enrollmentSubjects.length,
      });

      // 3. Obtener datos académicos del estudiante
      let studentAcademicData = null;
      if (enrollment.studentAcademicDataId) {
        try {
          studentAcademicData = await this.studentAcademicDataRepository.findById(
            enrollment.studentAcademicDataId
          );
          studentAcademicData = studentAcademicData?.toPlainObject
            ? studentAcademicData.toPlainObject()
            : studentAcademicData;
        } catch (err) {
          this.logger.warn('[Inscripciones] Error al obtener datos académicos', {
            enrollmentId: enrollment.id,
            studentAcademicDataId: enrollment.studentAcademicDataId,
            error: err.message,
          });
        }
      }

      // 4. Obtener gestión académica
      let management = null;
      if (enrollment.managementId) {
        try {
          management = await this.managementRepository.findById(enrollment.managementId);
          management = management?.toPlainObject ? management.toPlainObject() : management;
        } catch (err) {
          this.logger.warn('[Inscripciones] Error al obtener gestión', {
            enrollmentId: enrollment.id,
            managementId: enrollment.managementId,
            error: err.message,
          });
        }
      }

      // 5. Retornar la inscripción con todos sus datos relacionados
      const result = {
        enrollment: enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment,
        enrollmentSubjects: enrollmentSubjects.map((es) =>
          es.toPlainObject ? es.toPlainObject() : es
        ),
        related: {
          studentAcademicData,
          management,
        },
      };

      this.logger.info('[Inscripciones] Inscripción obtenida exitosamente', {
        enrollmentId: enrollment.id,
        enrollmentSubjectsCount: enrollmentSubjects.length,
        hasStudentAcademicData: !!studentAcademicData,
        hasManagement: !!management,
      });

      return result;
    } catch (error) {
      this.logger.error('[Inscripciones] Error al obtener inscripción por ID', {
        error: error.message,
        stack: error.stack,
        enrollmentId,
      });
      throw error;
    }
  }
}
