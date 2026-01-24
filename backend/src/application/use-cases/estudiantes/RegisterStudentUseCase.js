/**
 * Use Case: RegisterStudentUseCase
 * Módulo: Estudiantes
 * Registra un nuevo estudiante con todos sus datos relacionados
 * 
 * Responsabilidades:
 * - Validar que no exista un estudiante con el mismo CI
 * - Crear el estudiante principal
 * - Crear apoderados (múltiples)
 * - Crear discapacidades (múltiples)
 * - Crear orígenes (múltiples)
 * - Crear entregas de documentos (múltiples)
 * - Retornar el estudiante creado con todos sus datos
 * 
 * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja el registro completo de estudiantes
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 */

export class RegisterStudentUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.studentGuardianRepository - Repositorio de apoderados
   * @param {Object} params.studentDisabilityRepository - Repositorio de discapacidades
   * @param {Object} params.studentOriginRepository - Repositorio de orígenes
   * @param {Object} params.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} params.configuracionSistemaRepository - Repositorio de configuración del sistema
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    studentRepository,
    studentGuardianRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentDocumentDeliveryRepository,
    configuracionSistemaRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentGuardianRepository = studentGuardianRepository;
    this.studentDisabilityRepository = studentDisabilityRepository;
    this.studentOriginRepository = studentOriginRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.configuracionSistemaRepository = configuracionSistemaRepository;
    this.logger = logger;
  }

  /**
   * Genera el código del estudiante basado en la gestión actual y el correlativo
   * Formato: YYYYNNNN (ej: 20260001)
   * 
   * @returns {Promise<string>} Código del estudiante generado
   */
  async generateStudentCode() {
    // 1. Obtener la gestión actual
    const gestionActualConfig = await this.configuracionSistemaRepository.findBy(
      { key: 'gestion_actual' }
    );

    if (!gestionActualConfig) {
      throw new Error('No se encontró la configuración de gestión actual');
    }

    const gestionActual = gestionActualConfig.value;
    this.logger.info('[Estudiantes] Gestión actual obtenida', { gestionActual });

    // 2. Obtener el correlativo de la gestión actual
    const claveCorrelativo = `admision_gestion_${gestionActual}`;
    const correlativoConfig = await this.configuracionSistemaRepository.findBy(
      { key: claveCorrelativo }
    );

    if (!correlativoConfig) {
      throw new Error(
        `No se encontró la configuración de correlativo para la gestión ${gestionActual}`
      );
    }

    // 3. Incrementar el correlativo
    const nuevoCorrelativo = parseInt(correlativoConfig.value, 10) + 1;
    this.logger.info('[Estudiantes] Nuevo correlativo calculado', {
      gestion: gestionActual,
      correlativoAnterior: correlativoConfig.value,
      nuevoCorrelativo,
    });

    // 4. Actualizar el correlativo en la base de datos
    // NOTA: userId no se pasa porque actualmente no hay autenticación
    // El repositorio tiene userId = null como default
    await this.configuracionSistemaRepository.update(
      correlativoConfig.id,
      { value: nuevoCorrelativo.toString() }
    );

    // 5. Generar el código del estudiante: YYYYNNNN (rellenar con ceros a la izquierda)
    const codigoEstudiante = `${gestionActual}${nuevoCorrelativo.toString().padStart(4, '0')}`;
    
    this.logger.info('[Estudiantes] Código de estudiante generado', {
      codigoEstudiante,
      gestion: gestionActual,
      correlativo: nuevoCorrelativo,
    });

    return codigoEstudiante;
  }

  /**
   * Ejecuta el caso de uso de registro de estudiante
   * 
   * @param {Object} data - Datos del estudiante a registrar
   * @param {Object} data.student - Datos del estudiante principal
   * @param {Array} data.guardians - Array de apoderados
   * @param {Array} data.disabilities - Array de discapacidades
   * @param {Array} data.origins - Array de orígenes
   * @param {Object} data.documentation - Objeto con entregas de documentos (key: documentacionId)
   * @returns {Promise<Object>} Estudiante creado con todos sus datos relacionados
   * 
   * NOTA: Los datos académicos se manejan en otro módulo, no se incluyen aquí
   * NOTA: userId no se pasa porque actualmente no hay autenticación
   * Los repositorios tienen userId = null como default para los campos de auditoría
   */
  async execute(data) {
    this.logger.info('[Estudiantes] Iniciando registro de estudiante', {
      ci: data.student?.ci,
      expedicion: data.student?.expedicion,
    });

    try {
      // 1. Validar que no exista un estudiante con el mismo CI y expedición
      if (data.student?.ci && data.student?.expedicion) {
        const existingStudent = await this.studentRepository.findBy({
          ci: data.student.ci,
          expedicion: data.student.expedicion,
        });

        if (existingStudent) {
          throw new Error(
            `Ya existe un estudiante con CI ${data.student.ci} ${data.student.expedicion}`
          );
        }
      }

      // 2. Generar el código del estudiante
      const studentCode = await this.generateStudentCode();

      // 3. Crear el estudiante principal con el código generado
      const studentData = {
        ...data.student,
        studentCode, // Usar studentCode (dominio) en vez de codigoEstudiante (base de datos)
      };
      // NOTA: userId no se pasa porque actualmente no hay autenticación
      // El repositorio tiene userId = null como default
      const student = await this.studentRepository.create(studentData);
      this.logger.info('[Estudiantes] Estudiante creado', { 
        studentId: student.id,
        studentCode: student.studentCode,
      });

      // 4. Crear apoderados (múltiples)
      const guardians = [];
      if (data.guardians && Array.isArray(data.guardians)) {
        for (const guardianData of data.guardians) {
          const guardianToCreate = {
            ...guardianData,
            studentId: student.id,
          };
          // NOTA: userId no se pasa porque actualmente no hay autenticación
          // El repositorio tiene userId = null como default
          const guardian = await this.studentGuardianRepository.create(guardianToCreate);
          guardians.push(guardian);
        }
        this.logger.info('[Estudiantes] Apoderados creados', {
          studentId: student.id,
          count: guardians.length,
        });
      }

      // 5. Crear discapacidades (múltiples)
      const disabilities = [];
      if (data.disabilities && Array.isArray(data.disabilities)) {
        for (const disabilityData of data.disabilities) {
          const disabilityToCreate = {
            ...disabilityData,
            studentId: student.id,
          };
          // NOTA: userId no se pasa porque actualmente no hay autenticación
          // El repositorio tiene userId = null como default
          const disability = await this.studentDisabilityRepository.create(disabilityToCreate);
          disabilities.push(disability);
        }
        this.logger.info('[Estudiantes] Discapacidades creadas', {
          studentId: student.id,
          count: disabilities.length,
        });
      }

      // 6. Crear orígenes (múltiples)
      const origins = [];
      if (data.origins && Array.isArray(data.origins)) {
        for (const originData of data.origins) {
          const originToCreate = {
            ...originData,
            studentId: student.id,
          };
          // NOTA: userId no se pasa porque actualmente no hay autenticación
          // El repositorio tiene userId = null como default
          const origin = await this.studentOriginRepository.create(originToCreate);
          origins.push(origin);
        }
        this.logger.info('[Estudiantes] Orígenes creados', {
          studentId: student.id,
          count: origins.length,
        });
      }

      // 7. Crear entregas de documentos (múltiples)
      const documentDeliveries = [];
      if (data.documentation && typeof data.documentation === 'object') {
        // data.documentation es un objeto con keys como 'doc_1', 'doc_2', etc.
        for (const [docKey, docData] of Object.entries(data.documentation)) {
          // Extraer el ID del documento de la key (ej: 'doc_1' -> 1)
          const documentacionId = parseInt(docKey.replace('doc_', ''), 10);
          
          if (!isNaN(documentacionId) && docData) {
            const deliveryToCreate = {
              studentId: student.id,
              documentacionId,
              entregado: docData.entregado !== undefined ? docData.entregado : false,
              enTramite: docData.enTramite !== undefined ? docData.enTramite : false,
              fechaEntrega: docData.fechaEntrega || null,
              observaciones: docData.observaciones || null,
            };
            
            // NOTA: userId no se pasa porque actualmente no hay autenticación
            // El repositorio tiene userId = null como default
            const delivery = await this.studentDocumentDeliveryRepository.create(deliveryToCreate);
            documentDeliveries.push(delivery);
          }
        }
        this.logger.info('[Estudiantes] Entregas de documentos creadas', {
          studentId: student.id,
          count: documentDeliveries.length,
        });
      }

      // 8. Retornar el estudiante creado con todos sus datos relacionados
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

      this.logger.info('[Estudiantes] Estudiante registrado exitosamente', {
        studentId: student.id,
        guardiansCount: guardians.length,
        disabilitiesCount: disabilities.length,
        originsCount: origins.length,
        documentDeliveriesCount: documentDeliveries.length,
      });

      return result;
    } catch (error) {
      this.logger.error('[Estudiantes] Error al registrar estudiante', {
        error: error.message,
        stack: error.stack,
        ci: data.student?.ci,
        expedicion: data.student?.expedicion,
      });
      throw error;
    }
  }
}

