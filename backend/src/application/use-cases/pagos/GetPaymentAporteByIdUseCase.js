/**
 * Use Case: GetPaymentAporteByIdUseCase
 * Módulo: Pagos
 * Obtiene un pago de aporte por ID con todos sus datos relacionados
 * 
 * Responsabilidades:
 * - Validar que el pago exista
 * - Obtener el pago principal
 * - Obtener datos relacionados (estudiante, gestión, método de pago, beca, inscripción)
 * - Retornar el pago con todos sus datos relacionados
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja la obtención completa de pagos
 * - Dependency Inversion: Depende de abstracciones (repositorios)
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la lógica de negocio
 * - Depende de Repositories (Infrastructure) a través de abstracciones
 * - Usa Mapper (Application) para conversión Domain → Presentation
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';
import { ContributionPaymentMapper } from '../../mappers/pagos/index.js';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

export class GetPaymentAporteByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.contributionPaymentRepository - Repositorio de pagos de aportes
   * @param {Object} params.studentRepository - Repositorio de estudiantes
   * @param {Object} params.managementRepository - Repositorio de gestiones
   * @param {Object} params.paymentMethodRepository - Repositorio de métodos de pago
   * @param {Object} params.studentScholarshipRepository - Repositorio de asignaciones de becas
   * @param {Object} params.scholarshipRepository - Repositorio de becas/descuentos
   * @param {Object} params.enrollmentRepository - Repositorio de inscripciones
   * @param {ILogger} params.logger - Logger para registro de eventos
   */
  constructor({
    contributionPaymentRepository,
    studentRepository,
    managementRepository,
    paymentMethodRepository,
    studentScholarshipRepository,
    scholarshipRepository,
    enrollmentRepository,
    studentDocumentRepository,
    logger,
  }) {
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.studentRepository = studentRepository;
    this.managementRepository = managementRepository;
    this.paymentMethodRepository = paymentMethodRepository;
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.enrollmentRepository = enrollmentRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta el caso de uso de obtención de pago por ID
   * 
   * @param {number} paymentId - ID del pago a obtener
   * @returns {Promise<Object>} Pago con todos sus datos relacionados
   */
  async execute(paymentId) {
    this.logger.info('[Pagos] Iniciando obtención de pago por ID', {
      paymentId,
    });

    try {
      // 1. Obtener el pago principal
      const payment = await this.contributionPaymentRepository.findById(paymentId);

      if (!payment) {
        throw new NotFoundError(`No se encontró un pago con ID ${paymentId}`);
      }

      this.logger.info('[Pagos] Pago encontrado', {
        paymentId: payment.id,
      });

      // 2. Convertir entidad a formato de presentación
      // El mapper puede trabajar directamente con la entidad o con un objeto plano
      let paymentPlain;
      try {
        if (payment && typeof payment.toPlainObject === 'function') {
          // Si es una entidad, convertir a objeto plano primero
          const plain = payment.toPlainObject();
          paymentPlain = ContributionPaymentMapper.entityToPresentation(plain);
        } else {
          // Si ya es un objeto plano, usar directamente
          paymentPlain = ContributionPaymentMapper.entityToPresentation(payment);
        }
        
        this.logger.info('[Pagos] Pago convertido a formato de presentación', {
          paymentId: payment.id,
          hasStudentId: !!paymentPlain.student_id,
          hasManagementId: !!paymentPlain.management_id,
        });
      } catch (mapperError) {
        this.logger.error('[Pagos] Error al convertir pago a formato de presentación', {
          error: mapperError.message,
          stack: mapperError.stack,
          paymentId: payment.id,
        });
        throw mapperError;
      }

      // 3. Obtener datos relacionados
      const [student, management, paymentMethod, studentScholarship, scholarship, enrollment, reciboDocument] = await Promise.all([
        this._fetchStudent(paymentPlain.student_id),
        this._fetchManagement(paymentPlain.management_id),
        this._fetchPaymentMethod(paymentPlain.payment_method_id),
        this._fetchStudentScholarship(paymentPlain.student_scholarship_id),
        this._fetchScholarship(paymentPlain.student_scholarship_id),
        this._fetchEnrollment(paymentPlain.enrollment_id),
        this._fetchReciboDocument(paymentPlain.student_id, paymentId),
      ]);

      // 4. Construir respuesta enriquecida
      const result = {
        ...paymentPlain,
        estudiante: student ? this._mapStudent(student) : null,
        gestion: management ? this._mapManagement(management) : null,
        metodoPago: paymentMethod ? this._mapPaymentMethod(paymentMethod) : null,
        beca: studentScholarship ? {
          ...this._mapStudentScholarship(studentScholarship),
          tipoBeca: scholarship ? this._mapScholarship(scholarship) : null,
        } : null,
        inscripcion: enrollment ? this._mapEnrollment(enrollment) : null,
        reciboDocumento: reciboDocument ? this._mapReciboDocument(reciboDocument) : null,
      };

      this.logger.info('[Pagos] Pago obtenido exitosamente', {
        paymentId: payment.id,
        hasStudent: !!student,
        hasManagement: !!management,
        hasPaymentMethod: !!paymentMethod,
        hasBeca: !!studentScholarship,
        hasScholarship: !!scholarship,
        hasEnrollment: !!enrollment,
      });

      return result;
    } catch (error) {
      this.logger.error('[Pagos] Error al obtener pago por ID', {
        error: error.message,
        stack: error.stack,
        paymentId,
      });
      throw error;
    }
  }

  /**
   * Obtiene estudiante por ID
   * @private
   */
  async _fetchStudent(studentId) {
    if (!studentId) return null;

    try {
      const student = await this.studentRepository.findById(studentId);
      return student ? (student.toPlainObject ? student.toPlainObject() : student) : null;
    } catch (err) {
      this.logger.warn('[Pagos] Error al obtener estudiante', {
        studentId,
        error: err.message,
      });
      return null;
    }
  }

  /**
   * Obtiene gestión por ID
   * @private
   */
  async _fetchManagement(managementId) {
    if (!managementId) return null;

    try {
      const management = await this.managementRepository.findById(managementId);
      return management ? (management.toPlainObject ? management.toPlainObject() : management) : null;
    } catch (err) {
      this.logger.warn('[Pagos] Error al obtener gestión', {
        managementId,
        error: err.message,
      });
      return null;
    }
  }

  /**
   * Obtiene método de pago por ID
   * @private
   */
  async _fetchPaymentMethod(paymentMethodId) {
    if (!paymentMethodId) return null;

    try {
      const paymentMethod = await this.paymentMethodRepository.findById(paymentMethodId);
      return paymentMethod ? (paymentMethod.toPlainObject ? paymentMethod.toPlainObject() : paymentMethod) : null;
    } catch (err) {
      this.logger.warn('[Pagos] Error al obtener método de pago', {
        paymentMethodId,
        error: err.message,
      });
      return null;
    }
  }

  /**
   * Obtiene asignación de beca por ID
   * @private
   */
  async _fetchStudentScholarship(studentScholarshipId) {
    if (!studentScholarshipId) return null;

    try {
      const studentScholarship = await this.studentScholarshipRepository.findById(studentScholarshipId);
      if (!studentScholarship) return null;
      const plain = studentScholarship.toPlainObject ? studentScholarship.toPlainObject() : studentScholarship;
      return plain;
    } catch (err) {
      this.logger.warn('[Pagos] Error al obtener asignación de beca', {
        studentScholarshipId,
        error: err.message,
      });
      return null;
    }
  }

  /**
   * Obtiene beca por ID (usando el scholarshipId de la asignación)
   * @private
   */
  async _fetchScholarship(studentScholarshipId) {
    if (!studentScholarshipId) return null;

    try {
      // Primero obtener la asignación para obtener el scholarshipId
      const studentScholarship = await this.studentScholarshipRepository.findById(studentScholarshipId);
      if (!studentScholarship) return null;

      const plain = studentScholarship.toPlainObject ? studentScholarship.toPlainObject() : studentScholarship;
      const scholarshipId = plain.scholarshipId;

      if (!scholarshipId) return null;

      // Luego obtener la beca
      const scholarship = await this.scholarshipRepository.findById(scholarshipId);
      return scholarship ? (scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship) : null;
    } catch (err) {
      this.logger.warn('[Pagos] Error al obtener beca', {
        studentScholarshipId,
        error: err.message,
      });
      return null;
    }
  }

  /**
   * Obtiene inscripción por ID
   * @private
   */
  async _fetchEnrollment(enrollmentId) {
    if (!enrollmentId) return null;

    try {
      const enrollment = await this.enrollmentRepository.findById(enrollmentId);
      return enrollment ? (enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment) : null;
    } catch (err) {
      this.logger.warn('[Pagos] Error al obtener inscripción', {
        enrollmentId,
        error: err.message,
      });
      return null;
    }
  }

  /**
   * Obtiene el documento del recibo de pago asociado al pago
   * Busca el documento más reciente de tipo PAGO para el estudiante
   * @private
   */
  async _fetchReciboDocument(studentId, paymentId) {
    if (!studentId || !this.studentDocumentRepository) return null;

    try {
      // Buscar documentos de tipo PAGO para este estudiante
      // Ordenar por fecha de creación descendente para obtener el más reciente
      const result = await this.studentDocumentRepository.findAll({
        studentId,
        tipoDocumento: 'PAGO',
        sort: 'createdAt:DESC',
      }, 1, 10); // page 1, limit 10

      const documents = result?.studentDocuments || [];
      
      if (documents.length === 0) {
        return null;
      }

      // Buscar el documento que contiene el ID del pago en el nombre del archivo
      // El formato del nombre es: RECIBO_PAGO_{ci}_{numeroRecibo}_{timestamp}.pdf
      // donde numeroRecibo debería ser el ID del pago formateado
      const paymentIdStr = String(paymentId).padStart(6, '0');
      const reciboDocument = documents.find((doc) => {
        const plain = doc.toPlainObject ? doc.toPlainObject() : doc;
        const fileName = plain.fileName || '';
        // Buscar si el nombre del archivo contiene el número de recibo (ID del pago)
        return fileName.includes(paymentIdStr) || fileName.includes(`_${paymentId}_`);
      });

      // Si no se encuentra por ID, retornar el más reciente
      return reciboDocument || documents[0];
    } catch (err) {
      this.logger.warn('[Pagos] Error al obtener documento del recibo', {
        studentId,
        paymentId,
        error: err.message,
      });
      return null;
    }
  }

  /**
   * Mapea estudiante a formato de presentación
   * @private
   */
  _mapStudent(student) {
    const firstName = student.firstName || student.nombre || '';
    const lastName = student.lastName || student.apellidoPaterno || '';
    const motherLastName = student.motherLastName || student.apellidoMaterno || '';

    let nombreCompleto = [firstName, lastName, motherLastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!nombreCompleto) {
      nombreCompleto = student.nombreCompleto || '';
    }

    if (!nombreCompleto) {
      const ci = student.ci || '';
      const codigo = student.codigoEstudiante || student.studentCode || '';
      if (ci) {
        nombreCompleto = `CI: ${ci}`;
      } else if (codigo) {
        nombreCompleto = `Código: ${codigo}`;
      } else {
        nombreCompleto = `Estudiante #${student.id}`;
      }
    }

    return {
      id: student.id,
      nombreCompleto,
      nombre: firstName,
      apellidoPaterno: lastName,
      apellidoMaterno: motherLastName,
      ci: student.ci,
      expedicion: student.expedition || student.expedicion,
      codigoEstudiante: student.codigoEstudiante || student.studentCode,
    };
  }

  /**
   * Mapea gestión a formato de presentación
   * @private
   */
  _mapManagement(management) {
    return {
      id: management.id,
      codigo: management.codigo || management.code,
      nombre: management.nombre || management.name,
      anio: management.anio || management.year,
    };
  }

  /**
   * Mapea método de pago a formato de presentación
   * @private
   */
  _mapPaymentMethod(paymentMethod) {
    return {
      id: paymentMethod.id,
      nombre: paymentMethod.nombre || paymentMethod.name,
      codigo: paymentMethod.codigo || paymentMethod.code,
      descripcion: paymentMethod.descripcion || paymentMethod.description,
    };
  }

  /**
   * Mapea asignación de beca a formato de presentación
   * @private
   */
  _mapStudentScholarship(studentScholarship) {
    return {
      id: studentScholarship.id,
      estado: studentScholarship.state || studentScholarship.estado,
      fechaSolicitud: studentScholarship.requestDate || studentScholarship.fechaSolicitud,
    };
  }

  /**
   * Mapea beca a formato de presentación
   * @private
   */
  _mapScholarship(scholarship) {
    return {
      id: scholarship.id,
      nombre: scholarship.nombre || scholarship.name,
      codigo: scholarship.codigo || scholarship.code,
      porcentaje: scholarship.porcentaje || scholarship.percentage,
      descripcion: scholarship.descripcion || scholarship.description,
    };
  }

  /**
   * Mapea inscripción a formato de presentación
   * @private
   */
  _mapEnrollment(enrollment) {
    return {
      id: enrollment.id,
      codigo: enrollment.codigo,
      fechaInscripcion: enrollment.fechaInscripcion,
      estado: enrollment.estado,
    };
  }

  /**
   * Mapea documento del recibo a formato de presentación
   * @private
   */
  _mapReciboDocument(document) {
    const plain = document.toPlainObject ? document.toPlainObject() : document;
    return {
      id: plain.id,
      fileName: plain.fileName,
      filePath: plain.filePath,
      extension: plain.extension,
      tipoMime: plain.tipoMime,
    };
  }
}
