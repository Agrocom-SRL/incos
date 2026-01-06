/**
 * Use Case: GetStudentByIdUseCase
 * Módulo: Estudiantes
 * Obtiene un estudiante por ID con todos sus datos relacionados
 * 
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Obtener el estudiante principal
 * - Obtener apoderados (múltiples)
 * - Obtener discapacidades (múltiples)
 * - Obtener orígenes (múltiples)
 * - Obtener entregas de documentos (múltiples)
 * - Retornar el estudiante con todos sus datos relacionados
 * 
 * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la obtención completa de estudiantes
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

export class GetStudentByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentGuardianRepository - Repositorio de apoderados
   * @param {Object} params.studentDisabilityRepository - Repositorio de discapacidades
   * @param {Object} params.studentOriginRepository - Repositorio de orígenes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    studentRepository,
    studentGuardianRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentDocumentDeliveryRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentGuardianRepository = studentGuardianRepository;
    this.studentDisabilityRepository = studentDisabilityRepository;
    this.studentOriginRepository = studentOriginRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de obtención de estudiante por ID
   * 
   * @param {number} studentId - ID del estudiante a obtener
   * @returns {Promise<Object>} Estudiante con todos sus datos relacionados
   */
  async execute(studentId) {
    this.logger.info('[Estudiantes] Iniciando obtención de estudiante por ID', {
      studentId,
    });

    try {
      // 1. Obtener el estudiante principal
      const student = await this.studentRepository.findById(studentId);

      if (!student) {
        throw new Error(`No se encontró un estudiante con ID ${studentId}`);
      }

      this.logger.info('[Estudiantes] Estudiante encontrado', {
        studentId: student.id,
        studentCode: student.studentCode,
      });

      // 2. Obtener apoderados (múltiples)
      const guardiansResult = await this.studentGuardianRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const guardians = guardiansResult.studentGuardians || [];

      this.logger.info('[Estudiantes] Apoderados encontrados', {
        studentId: student.id,
        count: guardians.length,
      });

      // 3. Obtener discapacidades (múltiples)
      const disabilitiesResult = await this.studentDisabilityRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const disabilities = disabilitiesResult.studentDisabilities || [];

      this.logger.info('[Estudiantes] Discapacidades encontradas', {
        studentId: student.id,
        count: disabilities.length,
      });

      // 4. Obtener orígenes (múltiples)
      const originsResult = await this.studentOriginRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const origins = originsResult.studentOrigins || [];

      this.logger.info('[Estudiantes] Orígenes encontrados', {
        studentId: student.id,
        count: origins.length,
      });

      // 5. Obtener entregas de documentos (múltiples)
      const documentDeliveriesResult = await this.studentDocumentDeliveryRepository.findAll(
        { studentId: student.id },
        null,
        null
      );
      const documentDeliveries = documentDeliveriesResult.studentDocumentDeliveries || [];

      this.logger.info('[Estudiantes] Entregas de documentos encontradas', {
        studentId: student.id,
        count: documentDeliveries.length,
      });

      // 6. Retornar el estudiante con todos sus datos relacionados
      const result = {
        student: student.toPlainObject ? student.toPlainObject() : student,
        guardians: guardians.map((g) =>
          g.toPlainObject ? g.toPlainObject() : g
        ),
        disabilities: disabilities.map((d) =>
          d.toPlainObject ? d.toPlainObject() : d
        ),
        origins: origins.map((o) => (o.toPlainObject ? o.toPlainObject() : o)),
        documentDeliveries: documentDeliveries.map((d) =>
          d.toPlainObject ? d.toPlainObject() : d
        ),
      };

      this.logger.info('[Estudiantes] Estudiante obtenido exitosamente', {
        studentId: student.id,
        guardiansCount: guardians.length,
        disabilitiesCount: disabilities.length,
        originsCount: origins.length,
        documentDeliveriesCount: documentDeliveries.length,
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al obtener estudiante por ID', {
        error: error.message,
        stack: error.stack,
        studentId,
      });
      throw error;
    }
  }
}

