/**
 * Use Case: ListPagosAportesUseCase
 * Módulo: Pagos
 * Lista pagos de aportes con filtros, paginación y ordenamiento
 * 
 * Enriquece los datos con relaciones:
 * - Estudiante (student)
 * - Gestión (management)
 * - Inscripción (enrollment) - opcional
 * - Beca asignada (studentScholarship) con datos de la beca (scholarship)
 * - Método de pago (paymentMethod)
 */

import { BaseListUseCase } from '../base/BaseListUseCase.js';
import { ContributionPaymentMapper } from '../../mappers/pagos/index.js';

export class ListPagosAportesUseCase extends BaseListUseCase {
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
    logger,
  }) {
    super({
      repository: contributionPaymentRepository,
      logger,
      moduleName: 'Pagos',
      resourceName: 'pagos de aportes',
      // collectionFieldName: Nombre del campo en la respuesta del repositorio (estándar en inglés)
      // Debe coincidir con el valor retornado por repository.getCollectionName()
      collectionFieldName: 'contributionPayments',
      // dataFieldName: Nombre del campo en la respuesta final de la API (español para el frontend)
      // Este es el nombre que verá el cliente en la respuesta JSON
      dataFieldName: 'pagos',
    });

    this.studentRepository = studentRepository;
    this.managementRepository = managementRepository;
    this.paymentMethodRepository = paymentMethodRepository;
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.scholarshipRepository = scholarshipRepository;
    this.enrollmentRepository = enrollmentRepository;
  }

  /**
   * Retorna el mapper a usar para convertir entidades ContributionPayment a presentación
   * @returns {ContributionPaymentMapper}
   */
  getMapper() {
    return ContributionPaymentMapper;
  }

  /**
   * Enriquece los datos de pagos con información de relaciones
   * Similar a GetStudentByIdUseCase, obtiene datos completos de:
   * - Estudiante
   * - Gestión
   * - Método de pago
   * - Beca asignada (con datos de la beca)
   * - Inscripción (si existe)
   * 
   * @param {Array} data - Array de pagos ya convertidos a formato de presentación
   * @param {Object} repositoryResult - Resultado completo del repository
   * @returns {Promise<Array>} Array de pagos enriquecidos con relaciones
   */
  async enrichData(data, repositoryResult) {
    if (!Array.isArray(data) || data.length === 0) {
      return data;
    }

    this.logger.info('[Pagos] Iniciando enriquecimiento de datos de pagos', {
      count: data.length,
    });

    try {
      // Recopilar todos los IDs únicos para hacer consultas en batch
      const studentIds = new Set();
      const managementIds = new Set();
      const paymentMethodIds = new Set();
      const studentScholarshipIds = new Set();
      const enrollmentIds = new Set();

      data.forEach((payment) => {
        if (payment.student_id) studentIds.add(payment.student_id);
        if (payment.management_id) managementIds.add(payment.management_id);
        if (payment.payment_method_id) paymentMethodIds.add(payment.payment_method_id);
        if (payment.student_scholarship_id) studentScholarshipIds.add(payment.student_scholarship_id);
        if (payment.enrollment_id) enrollmentIds.add(payment.enrollment_id);
      });

      // Obtener datos relacionados en paralelo
      const [students, managements, paymentMethods, studentScholarships, enrollments] = await Promise.all([
        this._fetchStudents(Array.from(studentIds)),
        this._fetchManagements(Array.from(managementIds)),
        this._fetchPaymentMethods(Array.from(paymentMethodIds)),
        this._fetchStudentScholarships(Array.from(studentScholarshipIds)),
        this._fetchEnrollments(Array.from(enrollmentIds)),
      ]);

      // Obtener becas usando los scholarshipIds de las asignaciones ya obtenidas
      const scholarshipIds = new Set();
      Object.values(studentScholarships).forEach((studentScholarship) => {
        if (studentScholarship.scholarshipId) {
          scholarshipIds.add(studentScholarship.scholarshipId);
        }
      });
      const scholarships = await this._fetchScholarships(Array.from(scholarshipIds));

      // Enriquecer cada pago con sus relaciones
      const enrichedData = data.map((payment) => {
        const enriched = { ...payment };

        // Estudiante
        if (payment.student_id && students[payment.student_id]) {
          enriched.estudiante = this._mapStudent(students[payment.student_id]);
        }

        // Gestión
        if (payment.management_id && managements[payment.management_id]) {
          enriched.gestion = this._mapManagement(managements[payment.management_id]);
        }

        // Método de pago
        if (payment.payment_method_id && paymentMethods[payment.payment_method_id]) {
          enriched.metodoPago = this._mapPaymentMethod(paymentMethods[payment.payment_method_id]);
        }

        // Beca asignada
        if (payment.student_scholarship_id && studentScholarships[payment.student_scholarship_id]) {
          const studentScholarship = studentScholarships[payment.student_scholarship_id];
          enriched.beca = {
            ...this._mapStudentScholarship(studentScholarship),
            // Incluir datos de la beca si existe
            tipoBeca: studentScholarship.scholarshipId && scholarships[studentScholarship.scholarshipId]
              ? this._mapScholarship(scholarships[studentScholarship.scholarshipId])
              : null,
          };
        }

        // Inscripción (opcional)
        if (payment.enrollment_id && enrollments[payment.enrollment_id]) {
          enriched.inscripcion = this._mapEnrollment(enrollments[payment.enrollment_id]);
        }

        return enriched;
      });

      this.logger.info('[Pagos] Datos enriquecidos exitosamente', {
        count: enrichedData.length,
        studentsCount: Object.keys(students).length,
        managementsCount: Object.keys(managements).length,
        paymentMethodsCount: Object.keys(paymentMethods).length,
        studentScholarshipsCount: Object.keys(studentScholarships).length,
        scholarshipsCount: Object.keys(scholarships).length,
        enrollmentsCount: Object.keys(enrollments).length,
      });

      return enrichedData;
    } catch (error) {
      this.logger.error('[Pagos] Error al enriquecer datos de pagos', {
        error: error.message,
        stack: error.stack,
      });
      // En caso de error, retornar datos sin enriquecer en lugar de fallar
      return data;
    }
  }

  /**
   * Obtiene estudiantes por IDs
   * @private
   */
  async _fetchStudents(studentIds) {
    if (studentIds.length === 0) return {};

    const students = {};
    for (const studentId of studentIds) {
      try {
        const student = await this.studentRepository.findById(studentId);
        if (student) {
          students[studentId] = student.toPlainObject ? student.toPlainObject() : student;
        }
      } catch (err) {
        this.logger.warn('[Pagos] Error al obtener estudiante', {
          studentId,
          error: err.message,
        });
      }
    }
    return students;
  }

  /**
   * Obtiene gestiones por IDs
   * @private
   */
  async _fetchManagements(managementIds) {
    if (managementIds.length === 0) return {};

    const managements = {};
    for (const managementId of managementIds) {
      try {
        const management = await this.managementRepository.findById(managementId);
        if (management) {
          managements[managementId] = management.toPlainObject ? management.toPlainObject() : management;
        }
      } catch (err) {
        this.logger.warn('[Pagos] Error al obtener gestión', {
          managementId,
          error: err.message,
        });
      }
    }
    return managements;
  }

  /**
   * Obtiene métodos de pago por IDs
   * @private
   */
  async _fetchPaymentMethods(paymentMethodIds) {
    if (paymentMethodIds.length === 0) return {};

    const paymentMethods = {};
    for (const paymentMethodId of paymentMethodIds) {
      try {
        const paymentMethod = await this.paymentMethodRepository.findById(paymentMethodId);
        if (paymentMethod) {
          paymentMethods[paymentMethodId] = paymentMethod.toPlainObject ? paymentMethod.toPlainObject() : paymentMethod;
        }
      } catch (err) {
        this.logger.warn('[Pagos] Error al obtener método de pago', {
          paymentMethodId,
          error: err.message,
        });
      }
    }
    return paymentMethods;
  }

  /**
   * Obtiene asignaciones de becas por IDs
   * @private
   */
  async _fetchStudentScholarships(studentScholarshipIds) {
    if (studentScholarshipIds.length === 0) return {};

    const studentScholarships = {};
    for (const studentScholarshipId of studentScholarshipIds) {
      try {
        const studentScholarship = await this.studentScholarshipRepository.findById(studentScholarshipId);
        if (studentScholarship) {
          const plain = studentScholarship.toPlainObject ? studentScholarship.toPlainObject() : studentScholarship;
          studentScholarships[studentScholarshipId] = plain;
        }
      } catch (err) {
        this.logger.warn('[Pagos] Error al obtener asignación de beca', {
          studentScholarshipId,
          error: err.message,
        });
      }
    }
    return studentScholarships;
  }

  /**
   * Obtiene becas por IDs
   * @private
   */
  async _fetchScholarships(scholarshipIds) {
    if (scholarshipIds.length === 0) return {};

    const scholarships = {};
    for (const scholarshipId of scholarshipIds) {
      try {
        const scholarship = await this.scholarshipRepository.findById(scholarshipId);
        if (scholarship) {
          scholarships[scholarshipId] = scholarship.toPlainObject ? scholarship.toPlainObject() : scholarship;
        }
      } catch (err) {
        this.logger.warn('[Pagos] Error al obtener beca', {
          scholarshipId,
          error: err.message,
        });
      }
    }
    return scholarships;
  }

  /**
   * Obtiene inscripciones por IDs
   * @private
   */
  async _fetchEnrollments(enrollmentIds) {
    if (enrollmentIds.length === 0) return {};

    const enrollments = {};
    for (const enrollmentId of enrollmentIds) {
      try {
        const enrollment = await this.enrollmentRepository.findById(enrollmentId);
        if (enrollment) {
          enrollments[enrollmentId] = enrollment.toPlainObject ? enrollment.toPlainObject() : enrollment;
        }
      } catch (err) {
        this.logger.warn('[Pagos] Error al obtener inscripción', {
          enrollmentId,
          error: err.message,
        });
      }
    }
    return enrollments;
  }

  /**
   * Mapea estudiante a formato de presentación
   * @private
   */
  _mapStudent(student) {
    // La entidad Student usa nombres en inglés (firstName, lastName, motherLastName)
    // pero también puede venir con nombres en español si viene del mapper de aplicación
    const firstName = student.firstName || student.nombre || '';
    const lastName = student.lastName || student.apellidoPaterno || '';
    const motherLastName = student.motherLastName || student.apellidoMaterno || '';

    // Construir nombre completo
    let nombreCompleto = [firstName, lastName, motherLastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    // Si no hay nombre completo, usar nombreCompleto del objeto si existe
    if (!nombreCompleto) {
      nombreCompleto = student.nombreCompleto || '';
    }

    // Si aún no hay nombre completo, usar CI o código de estudiante como fallback
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
    // La entidad Management puede usar nombres en inglés o español
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
    // La entidad PaymentMethod puede usar nombres en inglés o español
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
    // La entidad Scholarship puede usar nombres en inglés o español
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
}
