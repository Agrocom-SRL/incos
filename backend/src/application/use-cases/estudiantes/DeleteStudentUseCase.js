/**
 * Use Case: DeleteStudentUseCase
 * Módulo: Estudiantes
 * Elimina un estudiante y todas sus relaciones (soft delete)
 *
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Validar que NO tenga inscripciones activas
 * - Validar que NO tenga pagos activos vinculados
 * - Validar que NO tenga becas activas asignadas
 * - Eliminar (soft delete) todas las relaciones:
 *   - Apoderados (estudiantes_apoderados)
 *   - Discapacidades (estudiantes_discapacidades)
 *   - Orígenes (estudiantes_origenes)
 *   - Entregas de documentos (estudiantes_documentos_entrega)
 *   - Documentos del estudiante (documentos_estudiante) - incluyendo actas de compromiso
 * - Eliminar el estudiante principal (estudiantes)
 *
 * Regla de negocio: Solo se pueden eliminar estudiantes que NO tengan:
 * - Inscripciones activas
 * - Pagos activos vinculados
 * - Becas activas asignadas
 *
 * Tablas afectadas (según RegisterStudentUseCase y GenerateActaCompromisoUseCase):
 * - estudiantes: Registro principal del estudiante
 * - estudiantes_apoderados: Apoderados del estudiante
 * - estudiantes_discapacidades: Discapacidades del estudiante
 * - estudiantes_origenes: Orígenes del estudiante
 * - estudiantes_documentos_entrega: Entregas de documentos
 * - documentos_estudiante: Documentos subidos/generados (incluyendo actas de compromiso)
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la eliminación de un estudiante
 * - Depende de: StudentRepository, StudentGuardianRepository, StudentDisabilityRepository,
 *   StudentOriginRepository, StudentDocumentDeliveryRepository, StudentDocumentRepository,
 *   EnrollmentRepository, ContributionPaymentRepository, StudentScholarshipRepository
 */

import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DeleteStudentUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {Object} dependencies.studentRepository - Repositorio de estudiantes
   * @param {Object} dependencies.studentGuardianRepository - Repositorio de apoderados
   * @param {Object} dependencies.studentDisabilityRepository - Repositorio de discapacidades
   * @param {Object} dependencies.studentOriginRepository - Repositorio de orígenes
   * @param {Object} dependencies.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {Object} dependencies.studentDocumentRepository - Repositorio de documentos de estudiantes
   * @param {Object} dependencies.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} dependencies.contributionPaymentRepository - Repositorio de pagos
   * @param {Object} dependencies.studentScholarshipRepository - Repositorio de becas asignadas
   * @param {ILogger} dependencies.logger - Logger para registro de eventos
   */
  constructor({
    studentRepository,
    studentGuardianRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentDocumentDeliveryRepository,
    studentDocumentRepository,
    enrollmentRepository,
    contributionPaymentRepository,
    studentScholarshipRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentGuardianRepository = studentGuardianRepository;
    this.studentDisabilityRepository = studentDisabilityRepository;
    this.studentOriginRepository = studentOriginRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.enrollmentRepository = enrollmentRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta la eliminación del estudiante
   *
   * @param {number} studentId - ID del estudiante a eliminar
   * @returns {Promise<void>}
   * @throws {NotFoundError} Si el estudiante no existe
   * @throws {ValidationError} Si el estudiante tiene relaciones activas
   */
  async execute(studentId) {
    try {
      this.logger.info('[Estudiantes] Iniciando eliminación de estudiante', {
        studentId,
      });

      // 1. Verificar que el estudiante existe
      const student = await this.studentRepository.findById(studentId);

      if (!student) {
        throw new NotFoundError(
          `Estudiante con ID ${studentId} no encontrado`
        );
      }

      const studentPlain = student.toPlainObject
        ? student.toPlainObject()
        : student;

      // 2. Validar que NO tenga inscripciones activas
      await this._validateNoActiveEnrollments(studentId);

      // 3. Validar que NO tenga pagos activos vinculados
      await this._validateNoActivePayments(studentId);

      // 4. Validar que NO tenga becas activas asignadas
      await this._validateNoActiveScholarships(studentId);

      // 5. Eliminar documentos del estudiante (incluyendo archivos físicos)
      await this._deleteStudentDocuments(studentId);

      // 6. Eliminar entregas de documentos
      await this._deleteDocumentDeliveries(studentId);

      // 7. Eliminar orígenes
      await this._deleteOrigins(studentId);

      // 8. Eliminar discapacidades
      await this._deleteDisabilities(studentId);

      // 9. Eliminar apoderados
      await this._deleteGuardians(studentId);

      // 10. Eliminar el estudiante principal (soft delete)
      const deleted = await this.studentRepository.delete(studentId);

      if (!deleted) {
        throw new NotFoundError(
          `No se pudo eliminar el estudiante con ID ${studentId}`
        );
      }

      this.logger.info('[Estudiantes] Estudiante eliminado exitosamente', {
        studentId,
        studentCode: studentPlain.studentCode || studentPlain.codigoEstudiante,
        ci: studentPlain.ci,
        expedicion: studentPlain.expedition || studentPlain.expedicion,
      });
    } catch (error) {
      this.logger.error('[Estudiantes] Error al eliminar estudiante', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Valida que el estudiante NO tenga inscripciones activas
   * @private
   * @param {number} studentId - ID del estudiante
   * @throws {ValidationError} Si tiene inscripciones activas
   */
  async _validateNoActiveEnrollments(studentId) {
    try {
      const enrollmentsResult = await this.enrollmentRepository.findAll(
        { studentId: studentId, active: true },
        null,
        null
      );

      const enrollments =
        enrollmentsResult.enrollments ||
        enrollmentsResult.inscripciones ||
        enrollmentsResult.data ||
        [];

      if (enrollments.length > 0) {
        const firstEnrollment = enrollments[0];
        const enrollmentPlain = firstEnrollment.toPlainObject
          ? firstEnrollment.toPlainObject()
          : firstEnrollment;
        const enrollmentId =
          enrollmentPlain.id ||
          enrollmentPlain.enrollmentId ||
          enrollmentPlain.inscripcionId;

        this.logger.warn(
          '[Estudiantes] Intento de eliminar estudiante con inscripciones activas',
          {
            studentId,
            enrollmentsCount: enrollments.length,
            firstEnrollmentId: enrollmentId,
          }
        );

        throw new ValidationError(
          `No se puede eliminar el estudiante porque tiene ${enrollments.length} inscripción(es) activa(s). ` +
            `ID de inscripción: ${enrollmentId || 'N/A'}. ` +
            `Solo se pueden eliminar estudiantes que no tengan inscripciones asociadas.`
        );
      }

      this.logger.info(
        '[Estudiantes] Validación exitosa: el estudiante no tiene inscripciones activas',
        {
          studentId,
        }
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      this.logger.error(
        '[Estudiantes] Error al validar inscripciones del estudiante',
        {
          studentId,
          error: error.message,
          stack: error.stack,
        }
      );
      throw error;
    }
  }

  /**
   * Valida que el estudiante NO tenga pagos activos vinculados
   * @private
   * @param {number} studentId - ID del estudiante
   * @throws {ValidationError} Si tiene pagos activos
   */
  async _validateNoActivePayments(studentId) {
    try {
      const paymentsResult = await this.contributionPaymentRepository.findAll(
        { studentId: studentId, active: true },
        null,
        null
      );

      const payments =
        paymentsResult.contributionPayments ||
        paymentsResult.pagos ||
        paymentsResult.payments ||
        [];

      if (payments.length > 0) {
        const firstPayment = payments[0];
        const paymentPlain = firstPayment.toPlainObject
          ? firstPayment.toPlainObject()
          : firstPayment;
        const receiptNumber =
          paymentPlain.receiptNumber ??
          paymentPlain.numero_recibo ??
          paymentPlain.numeroRecibo ??
          paymentPlain.id;

        this.logger.warn(
          '[Estudiantes] Intento de eliminar estudiante con pagos activos',
          {
            studentId,
            paymentsCount: payments.length,
            firstPaymentId: paymentPlain.id,
            receiptNumber,
          }
        );

        throw new ValidationError(
          `No se puede eliminar el estudiante porque tiene ${payments.length} pago(s) activo(s). ` +
            `Número de recibo: ${receiptNumber || 'N/A'}. ` +
            `Solo se pueden eliminar estudiantes que no tengan pagos asociados.`
        );
      }

      this.logger.info(
        '[Estudiantes] Validación exitosa: el estudiante no tiene pagos activos',
        {
          studentId,
        }
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      this.logger.error(
        '[Estudiantes] Error al validar pagos del estudiante',
        {
          studentId,
          error: error.message,
          stack: error.stack,
        }
      );
      throw error;
    }
  }

  /**
   * Valida que el estudiante NO tenga becas activas asignadas
   * @private
   * @param {number} studentId - ID del estudiante
   * @throws {ValidationError} Si tiene becas activas
   */
  async _validateNoActiveScholarships(studentId) {
    try {
      const scholarshipsResult =
        await this.studentScholarshipRepository.findAll(
          { studentId: studentId, active: true },
          null,
          null
        );

      const scholarships =
        scholarshipsResult.studentScholarships ||
        scholarshipsResult.becas ||
        scholarshipsResult.data ||
        [];

      if (scholarships.length > 0) {
        const firstScholarship = scholarships[0];
        const scholarshipPlain = firstScholarship.toPlainObject
          ? firstScholarship.toPlainObject()
          : firstScholarship;
        const scholarshipId =
          scholarshipPlain.id ||
          scholarshipPlain.scholarshipId ||
          scholarshipPlain.becaId;

        this.logger.warn(
          '[Estudiantes] Intento de eliminar estudiante con becas activas',
          {
            studentId,
            scholarshipsCount: scholarships.length,
            firstScholarshipId: scholarshipId,
          }
        );

        throw new ValidationError(
          `No se puede eliminar el estudiante porque tiene ${scholarships.length} beca(s) activa(s) asignada(s). ` +
            `ID de beca: ${scholarshipId || 'N/A'}. ` +
            `Solo se pueden eliminar estudiantes que no tengan becas asociadas.`
        );
      }

      this.logger.info(
        '[Estudiantes] Validación exitosa: el estudiante no tiene becas activas',
        {
          studentId,
        }
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      this.logger.error(
        '[Estudiantes] Error al validar becas del estudiante',
        {
          studentId,
          error: error.message,
          stack: error.stack,
        }
      );
      throw error;
    }
  }

  /**
   * Elimina todos los documentos del estudiante (soft delete) y archivos físicos
   * @private
   * @param {number} studentId - ID del estudiante
   */
  async _deleteStudentDocuments(studentId) {
    try {
      // Buscar todos los documentos del estudiante
      const documentsResult = await this.studentDocumentRepository.findAll(
        { studentId: studentId, active: true },
        null,
        null
      );

      const documents =
        documentsResult.studentDocuments ||
        documentsResult.documentos ||
        documentsResult.data ||
        [];

      this.logger.info('[Estudiantes] Eliminando documentos del estudiante', {
        studentId,
        documentsCount: documents.length,
      });

      // Eliminar archivos físicos y registros en BD
      for (const document of documents) {
        const docPlain = document.toPlainObject
          ? document.toPlainObject()
          : document;

        const filePath = docPlain.filePath || docPlain.rutaArchivo;
        const relativePath = filePath || '';

        // Construir ruta absoluta del archivo
        const uploadDir = serverConfig.uploadsPath || 'uploads';
        const absolutePath = path.isAbsolute(uploadDir)
          ? path.join(uploadDir, relativePath)
          : path.resolve(__dirname, '../../../..', uploadDir, relativePath);

        // Eliminar archivo físico si existe
        if (relativePath && fs.existsSync(absolutePath)) {
          try {
            fs.unlinkSync(absolutePath);
            this.logger.info(
              '[Estudiantes] Archivo físico eliminado',
              {
                studentId,
                documentId: docPlain.id,
                filePath: absolutePath,
              }
            );
          } catch (fileError) {
            this.logger.warn(
              '[Estudiantes] Error al eliminar archivo físico (continuando)',
              {
                studentId,
                documentId: docPlain.id,
                filePath: absolutePath,
                error: fileError.message,
              }
            );
          }
        }

        // Eliminar registro en BD (soft delete)
        await this.studentDocumentRepository.delete(docPlain.id);
      }

      this.logger.info(
        '[Estudiantes] Documentos del estudiante eliminados exitosamente',
        {
          studentId,
          documentsCount: documents.length,
        }
      );
    } catch (error) {
      this.logger.error(
        '[Estudiantes] Error al eliminar documentos del estudiante',
        {
          studentId,
          error: error.message,
          stack: error.stack,
        }
      );
      throw error;
    }
  }

  /**
   * Elimina todas las entregas de documentos del estudiante (soft delete)
   * @private
   * @param {number} studentId - ID del estudiante
   */
  async _deleteDocumentDeliveries(studentId) {
    try {
      const deliveriesResult =
        await this.studentDocumentDeliveryRepository.findAll(
          { studentId: studentId, active: true },
          null,
          null
        );

      const deliveries =
        deliveriesResult.studentDocumentDeliveries ||
        deliveriesResult.entregas ||
        deliveriesResult.data ||
        [];

      this.logger.info(
        '[Estudiantes] Eliminando entregas de documentos del estudiante',
        {
          studentId,
          deliveriesCount: deliveries.length,
        }
      );

      for (const delivery of deliveries) {
        const deliveryPlain = delivery.toPlainObject
          ? delivery.toPlainObject()
          : delivery;
        await this.studentDocumentDeliveryRepository.delete(deliveryPlain.id);
      }

      this.logger.info(
        '[Estudiantes] Entregas de documentos eliminadas exitosamente',
        {
          studentId,
          deliveriesCount: deliveries.length,
        }
      );
    } catch (error) {
      this.logger.error(
        '[Estudiantes] Error al eliminar entregas de documentos',
        {
          studentId,
          error: error.message,
          stack: error.stack,
        }
      );
      throw error;
    }
  }

  /**
   * Elimina todos los orígenes del estudiante (soft delete)
   * @private
   * @param {number} studentId - ID del estudiante
   */
  async _deleteOrigins(studentId) {
    try {
      const originsResult = await this.studentOriginRepository.findAll(
        { studentId: studentId, active: true },
        null,
        null
      );

      const origins =
        originsResult.studentOrigins ||
        originsResult.origenes ||
        originsResult.data ||
        [];

      this.logger.info('[Estudiantes] Eliminando orígenes del estudiante', {
        studentId,
        originsCount: origins.length,
      });

      for (const origin of origins) {
        const originPlain = origin.toPlainObject
          ? origin.toPlainObject()
          : origin;
        await this.studentOriginRepository.delete(originPlain.id);
      }

      this.logger.info(
        '[Estudiantes] Orígenes eliminados exitosamente',
        {
          studentId,
          originsCount: origins.length,
        }
      );
    } catch (error) {
      this.logger.error('[Estudiantes] Error al eliminar orígenes', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Elimina todas las discapacidades del estudiante (soft delete)
   * @private
   * @param {number} studentId - ID del estudiante
   */
  async _deleteDisabilities(studentId) {
    try {
      const disabilitiesResult =
        await this.studentDisabilityRepository.findAll(
          { studentId: studentId, active: true },
          null,
          null
        );

      const disabilities =
        disabilitiesResult.studentDisabilities ||
        disabilitiesResult.discapacidades ||
        disabilitiesResult.data ||
        [];

      this.logger.info(
        '[Estudiantes] Eliminando discapacidades del estudiante',
        {
          studentId,
          disabilitiesCount: disabilities.length,
        }
      );

      for (const disability of disabilities) {
        const disabilityPlain = disability.toPlainObject
          ? disability.toPlainObject()
          : disability;
        await this.studentDisabilityRepository.delete(disabilityPlain.id);
      }

      this.logger.info(
        '[Estudiantes] Discapacidades eliminadas exitosamente',
        {
          studentId,
          disabilitiesCount: disabilities.length,
        }
      );
    } catch (error) {
      this.logger.error(
        '[Estudiantes] Error al eliminar discapacidades',
        {
          studentId,
          error: error.message,
          stack: error.stack,
        }
      );
      throw error;
    }
  }

  /**
   * Elimina todos los apoderados del estudiante (soft delete)
   * @private
   * @param {number} studentId - ID del estudiante
   */
  async _deleteGuardians(studentId) {
    try {
      const guardiansResult = await this.studentGuardianRepository.findAll(
        { studentId: studentId, active: true },
        null,
        null
      );

      const guardians =
        guardiansResult.studentGuardians ||
        guardiansResult.apoderados ||
        guardiansResult.data ||
        [];

      this.logger.info('[Estudiantes] Eliminando apoderados del estudiante', {
        studentId,
        guardiansCount: guardians.length,
      });

      for (const guardian of guardians) {
        const guardianPlain = guardian.toPlainObject
          ? guardian.toPlainObject()
          : guardian;
        await this.studentGuardianRepository.delete(guardianPlain.id);
      }

      this.logger.info(
        '[Estudiantes] Apoderados eliminados exitosamente',
        {
          studentId,
          guardiansCount: guardians.length,
        }
      );
    } catch (error) {
      this.logger.error('[Estudiantes] Error al eliminar apoderados', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
