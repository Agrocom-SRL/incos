/**
 * Use Case: DeleteStudentUseCase
 * Módulo: Estudiantes
 * Elimina un estudiante y todas sus relaciones (soft delete)
 *
 * Responsabilidades:
 * - Validar que el estudiante exista
 * - Soft delete en cascada (sin calificaciones ni historial_nivelaciones; módulos aún no usados):
 *   - Inscripciones (inscripciones) e inscripciones_materias del estudiante vía datos académicos
 *   - pago_cuotas y pago_aporte
 *   - estudiantes_becas
 *   - licencias (vía inscripcion_id), traspasos, transitabilidades (estudiante_id)
 *   - documentos_estudiante (y archivos), estudiantes_documentos_entrega
 *   - estudiantes_origenes, estudiantes_discapacidades, estudiantes_apoderados
 *   - estudiantes_datos_academicos
 * - Eliminar el estudiante principal (estudiantes)
 *
 * Regla de negocio: eliminación lógica completa del vínculo del estudiante con el sistema.
 *
 * Tablas afectadas (entre otras):
 * - inscripciones_materias, inscripciones
 * - pago_cuotas, pago_aporte
 * - estudiantes_becas
 * - licencias_solicitudes, traspasos, transitabilidades
 * - documentos_estudiante, estudiantes_documentos_entrega
 * - estudiantes_origenes, estudiantes_discapacidades, estudiantes_apoderados
 * - estudiantes_datos_academicos, estudiantes
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la eliminación de un estudiante
 * - Depende de: StudentRepository, StudentGuardianRepository, StudentDisabilityRepository,
 *   StudentOriginRepository, StudentDocumentDeliveryRepository, StudentDocumentRepository,
 *   StudentAcademicDataRepository, EnrollmentRepository, subjectEnrollmentRepository,
 *   ContributionPaymentRepository, ContributionPaymentInstallmentRepository, StudentScholarshipRepository,
 *   LicenseRepository, TransferRepository, TransitabilityRepository
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';
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
   * @param {Object} dependencies.studentAcademicDataRepository - Repositorio de datos académicos
   * @param {Object} dependencies.enrollmentRepository - Repositorio de inscripciones
   * @param {Object} dependencies.subjectEnrollmentRepository - Repositorio de inscripciones_materias
   * @param {Object} dependencies.contributionPaymentRepository - Repositorio de cabecera de aporte (pago_aporte)
   * @param {Object} dependencies.contributionPaymentInstallmentRepository - Repositorio de cuotas (pago_cuotas)
   * @param {Object} dependencies.studentScholarshipRepository - Repositorio de becas asignadas
   * @param {Object} dependencies.licenseRepository - Repositorio de licencias (`licencias`)
   * @param {Object} dependencies.transferRepository - Repositorio de traspasos
   * @param {Object} dependencies.transitabilityRepository - Repositorio de transitabilidades
   * @param {ILogger} dependencies.logger - Logger para registro de eventos
   */
  constructor({
    studentRepository,
    studentGuardianRepository,
    studentDisabilityRepository,
    studentOriginRepository,
    studentDocumentDeliveryRepository,
    studentDocumentRepository,
    studentAcademicDataRepository,
    enrollmentRepository,
    subjectEnrollmentRepository,
    contributionPaymentRepository,
    contributionPaymentInstallmentRepository,
    studentScholarshipRepository,
    licenseRepository,
    transferRepository,
    transitabilityRepository,
    logger,
  }) {
    this.studentRepository = studentRepository;
    this.studentGuardianRepository = studentGuardianRepository;
    this.studentDisabilityRepository = studentDisabilityRepository;
    this.studentOriginRepository = studentOriginRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.studentAcademicDataRepository = studentAcademicDataRepository;
    this.enrollmentRepository = enrollmentRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.contributionPaymentInstallmentRepository = contributionPaymentInstallmentRepository;
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.licenseRepository = licenseRepository;
    this.transferRepository = transferRepository;
    this.transitabilityRepository = transitabilityRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta la eliminación del estudiante
   *
   * @param {number} studentId - ID del estudiante a eliminar
   * @returns {Promise<void>}
   * @throws {NotFoundError} Si el estudiante no existe
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

      // 2. Licencias (antes de inscripciones: FK inscripcion_id)
      await this._deleteLicensesForStudent(studentId);

      // 3. Inscripciones e inscripciones_materias (soft delete)
      await this._deleteEnrollmentsForStudent(studentId);

      // 4. Cuotas y cabeceras de aporte (soft delete)
      await this._deleteContributionPaymentsForStudent(studentId);

      // 5. Becas asignadas (soft delete)
      await this._deleteStudentScholarshipsForStudent(studentId);

      // 6. Traspasos y transitabilidades (soft delete)
      await this._deleteTransfersForStudent(studentId);
      await this._deleteTransitabilitiesForStudent(studentId);

      // 7. Documentos del estudiante (incluyendo archivos físicos)
      await this._deleteStudentDocuments(studentId);

      // 7. Entregas de documentos
      await this._deleteDocumentDeliveries(studentId);

      // 8. Orígenes
      await this._deleteOrigins(studentId);

      // 9. Discapacidades
      await this._deleteDisabilities(studentId);

      // 10. Apoderados
      await this._deleteGuardians(studentId);

      // 11. Datos académicos
      await this._deleteAcademicData(studentId);

      // 12. Estudiante principal (soft delete)
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
   * Soft delete de todas las inscripciones del estudiante y sus inscripciones_materias.
   * No toca calificaciones ni historial_nivelaciones (módulos no implementados).
   *
   * @private
   * @param {number} studentId
   */
  async _deleteEnrollmentsForStudent(studentId) {
    try {
      const academicDataResult = await this.studentAcademicDataRepository.findAll(
        { studentId, active: true },
        null,
        null
      );

      const academicDataList =
        academicDataResult.studentAcademicData ||
        academicDataResult.datosAcademicos ||
        academicDataResult.data ||
        [];

      let enrollmentsDeleted = 0;
      let subjectsDeleted = 0;

      for (const academicData of academicDataList) {
        const academicDataPlain = academicData.toPlainObject
          ? academicData.toPlainObject()
          : academicData;
        const academicDataId =
          academicDataPlain.id ||
          academicDataPlain.academicDataId ||
          academicDataPlain.datosAcademicosId;

        if (!academicDataId) continue;

        const enrollmentsResult = await this.enrollmentRepository.findAll(
          { academicDataId, active: true },
          null,
          null
        );

        const enrollments =
          enrollmentsResult.enrollments ||
          enrollmentsResult.inscripciones ||
          enrollmentsResult.data ||
          [];

        for (const enrollment of enrollments) {
          const enrollmentPlain = enrollment.toPlainObject
            ? enrollment.toPlainObject()
            : enrollment;
          const enrollmentId =
            enrollmentPlain.id ||
            enrollmentPlain.enrollmentId ||
            enrollmentPlain.inscripcionId;

          if (!enrollmentId) continue;

          const n = await this._deletesubjectEnrollmentsForEnrollment(enrollmentId);
          subjectsDeleted += n;
          await this.enrollmentRepository.delete(enrollmentId);
          enrollmentsDeleted += 1;
        }
      }

      this.logger.info('[Estudiantes] Inscripciones y materias inscritas eliminadas (soft delete)', {
        studentId,
        enrollmentsDeleted,
        subjectsDeleted,
      });
    } catch (error) {
      this.logger.error('[Estudiantes] Error al eliminar inscripciones del estudiante', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @private
   * @param {number} enrollmentId
   * @returns {Promise<number>} Cantidad de inscripciones_materias eliminadas
   */
  async _deletesubjectEnrollmentsForEnrollment(enrollmentId) {
    const subjectEnrollmentsResult = await this.subjectEnrollmentRepository.findAll(
      { enrollmentId, active: true },
      null,
      null
    );

    const subjectEnrollments =
      subjectEnrollmentsResult.subjectEnrollments ||
      subjectEnrollmentsResult.enrollmentMaterias ||
      subjectEnrollmentsResult.data ||
      [];

    let count = 0;
    for (const row of subjectEnrollments) {
      const plain = row.toPlainObject ? row.toPlainObject() : row;
      const id = plain.id;
      if (id != null) {
        await this.subjectEnrollmentRepository.delete(id);
        count += 1;
      }
    }
    return count;
  }

  /**
   * Soft delete de todas las cuotas (pago_cuotas) y cabeceras (pago_aporte) activas del estudiante.
   * Orden: cuotas primero, luego cabeceras (evita depender de que el usuario borre cuotas a mano).
   *
   * @private
   * @param {number} studentId - ID del estudiante
   */
  async _deleteContributionPaymentsForStudent(studentId) {
    try {
      const paymentsResult = await this.contributionPaymentRepository.findAll(
        { studentId, active: true },
        null,
        null
      );

      const payments =
        paymentsResult.contributionPayments ||
        paymentsResult.pagos ||
        paymentsResult.payments ||
        [];

      if (payments.length === 0) {
        this.logger.info('[Estudiantes] Sin aportes activos que eliminar', { studentId });
        return;
      }

      let cuotasDeleted = 0;
      let aportesDeleted = 0;

      for (const payment of payments) {
        const plain = payment.toPlainObject ? payment.toPlainObject() : payment;
        const pagoAporteId = plain.id;
        if (!pagoAporteId) continue;

        const installmentsResult =
          await this.contributionPaymentInstallmentRepository.findAll(
            { contributionPaymentId: pagoAporteId, active: true },
            null,
            null
          );

        const installments =
          installmentsResult.contributionPaymentInstallments ||
          installmentsResult.pagoCuotas ||
          installmentsResult.cuotas ||
          installmentsResult.data ||
          [];

        for (const inst of installments) {
          const instPlain = inst.toPlainObject ? inst.toPlainObject() : inst;
          const instId = instPlain.id;
          if (instId != null) {
            await this.contributionPaymentInstallmentRepository.delete(instId);
            cuotasDeleted += 1;
          }
        }

        await this.contributionPaymentRepository.delete(pagoAporteId);
        aportesDeleted += 1;
      }

      this.logger.info('[Estudiantes] Aportes y cuotas del estudiante eliminados (soft delete)', {
        studentId,
        aportesDeleted,
        cuotasDeleted,
      });
    } catch (error) {
      this.logger.error(
        '[Estudiantes] Error al eliminar aportes/cuotas del estudiante',
        { studentId, error: error.message, stack: error.stack }
      );
      throw error;
    }
  }

  /**
   * Soft delete de todas las becas activas del estudiante (estudiantes_becas).
   * @private
   * @param {number} studentId
   */
  async _deleteStudentScholarshipsForStudent(studentId) {
    try {
      const scholarshipsResult = await this.studentScholarshipRepository.findAll(
        { studentId, active: true },
        null,
        null
      );

      const scholarships =
        scholarshipsResult.studentScholarships ||
        scholarshipsResult.becas ||
        scholarshipsResult.data ||
        [];

      for (const row of scholarships) {
        const plain = row.toPlainObject ? row.toPlainObject() : row;
        const id = plain.id;
        if (id != null) {
          await this.studentScholarshipRepository.delete(id);
        }
      }

      this.logger.info('[Estudiantes] Becas del estudiante eliminadas (soft delete)', {
        studentId,
        count: scholarships.length,
      });
    } catch (error) {
      this.logger.error('[Estudiantes] Error al eliminar becas del estudiante', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Recolecta IDs de inscripciones activas del estudiante (vía datos académicos).
   * @private
   * @param {number} studentId
   * @returns {Promise<number[]>}
   */
  async _collectEnrollmentIdsForStudent(studentId) {
    const academicDataResult = await this.studentAcademicDataRepository.findAll(
      { studentId },
      null,
      null
    );

    const academicDataList =
      academicDataResult.studentAcademicData ||
      academicDataResult.datosAcademicos ||
      academicDataResult.data ||
      [];

    const enrollmentIds = [];

    for (const academicData of academicDataList) {
      const academicDataPlain = academicData.toPlainObject
        ? academicData.toPlainObject()
        : academicData;
      const academicDataId =
        academicDataPlain.id ||
        academicDataPlain.academicDataId ||
        academicDataPlain.datosAcademicosId;

      if (!academicDataId) continue;

      const enrollmentsResult = await this.enrollmentRepository.findAll(
        { academicDataId },
        null,
        null
      );

      const enrollments =
        enrollmentsResult.enrollments ||
        enrollmentsResult.inscripciones ||
        enrollmentsResult.data ||
        [];

      for (const enrollment of enrollments) {
        const enrollmentPlain = enrollment.toPlainObject
          ? enrollment.toPlainObject()
          : enrollment;
        const enrollmentId =
          enrollmentPlain.id ||
          enrollmentPlain.enrollmentId ||
          enrollmentPlain.inscripcionId;

        if (enrollmentId != null) {
          enrollmentIds.push(enrollmentId);
        }
      }
    }

    return enrollmentIds;
  }

  /**
   * Soft delete de licencias vinculadas a inscripciones del estudiante.
   * @private
   * @param {number} studentId
   */
  async _deleteLicensesForStudent(studentId) {
    try {
      const enrollmentIds = await this._collectEnrollmentIdsForStudent(studentId);

      if (enrollmentIds.length === 0) {
        this.logger.info('[Estudiantes] Sin licencias que eliminar (sin inscripciones)', {
          studentId,
        });
        return;
      }

      const result = await this.licenseRepository.findAll(
        { enrollmentIds, includeInactive: true },
        null,
        null
      );
      const rows = result.licenses || result.data || [];

      for (const row of rows) {
        const plain = row.toPlainObject ? row.toPlainObject() : row;
        if (plain.id != null) {
          await this.licenseRepository.delete(plain.id);
        }
      }

      this.logger.info('[Estudiantes] Licencias del estudiante eliminadas (soft delete)', {
        studentId,
        count: rows.length,
      });
    } catch (error) {
      this.logger.error('[Estudiantes] Error al eliminar licencias del estudiante', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @private
   * @param {number} studentId
   */
  async _deleteTransfersForStudent(studentId) {
    try {
      const result = await this.transferRepository.findAll(
        { studentId, active: true },
        null,
        null
      );
      const rows = result.transfers || result.traspasos || result.data || [];

      for (const row of rows) {
        const plain = row.toPlainObject ? row.toPlainObject() : row;
        if (plain.id != null) {
          await this.transferRepository.delete(plain.id);
        }
      }

      this.logger.info('[Estudiantes] Traspasos del estudiante eliminados (soft delete)', {
        studentId,
        count: rows.length,
      });
    } catch (error) {
      this.logger.error('[Estudiantes] Error al eliminar traspasos del estudiante', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * @private
   * @param {number} studentId
   */
  async _deleteTransitabilitiesForStudent(studentId) {
    try {
      const result = await this.transitabilityRepository.findAll(
        { studentId, active: true },
        null,
        null
      );
      const rows =
        result.transitabilities ||
        result.transitabilidades ||
        result.data ||
        [];

      for (const row of rows) {
        const plain = row.toPlainObject ? row.toPlainObject() : row;
        if (plain.id != null) {
          await this.transitabilityRepository.delete(plain.id);
        }
      }

      this.logger.info('[Estudiantes] Transitabilidades del estudiante eliminadas (soft delete)', {
        studentId,
        count: rows.length,
      });
    } catch (error) {
      this.logger.error('[Estudiantes] Error al eliminar transitabilidades del estudiante', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
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
        { studentId, active: true },
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
          { studentId, active: true },
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
        { studentId, active: true },
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
          { studentId, active: true },
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
        { studentId, active: true },
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

  /**
   * Elimina los datos académicos del estudiante (soft delete)
   * NOTA: Este método no falla si no puede eliminar los datos académicos.
   * Solo registra un warning y continúa, ya que los datos académicos pueden
   * no existir o tener restricciones que impidan su eliminación.
   * @private
   * @param {number} studentId - ID del estudiante
   */
  async _deleteAcademicData(studentId) {
    try {
      const academicDataResult = await this.studentAcademicDataRepository.findAll(
        { studentId, active: true },
        null,
        null
      );

      const academicDataList =
        academicDataResult.studentAcademicData ||
        academicDataResult.datosAcademicos ||
        academicDataResult.data ||
        [];

      // Si no hay datos académicos, simplemente continuar
      if (academicDataList.length === 0) {
        this.logger.info('[Estudiantes] No hay datos académicos para eliminar', {
          studentId,
        });
        return;
      }

      this.logger.info('[Estudiantes] Eliminando datos académicos del estudiante', {
        studentId,
        academicDataCount: academicDataList.length,
      });

      let deletedCount = 0;
      let errorCount = 0;

      for (const academicData of academicDataList) {
        try {
          const academicDataPlain = academicData.toPlainObject
            ? academicData.toPlainObject()
            : academicData;
          await this.studentAcademicDataRepository.delete(academicDataPlain.id);
          deletedCount++;
        } catch (deleteError) {
          errorCount++;
          this.logger.warn(
            '[Estudiantes] No se pudo eliminar un registro de datos académicos (continuando)',
            {
              studentId,
              academicDataId: academicData.id || 'N/A',
              error: deleteError.message,
            }
          );
        }
      }

      if (deletedCount > 0) {
        this.logger.info(
          '[Estudiantes] Datos académicos eliminados exitosamente',
          {
            studentId,
            deletedCount,
            totalCount: academicDataList.length,
          }
        );
      }

      if (errorCount > 0) {
        this.logger.warn(
          '[Estudiantes] Algunos datos académicos no pudieron ser eliminados (continuando con eliminación del estudiante)',
          {
            studentId,
            errorCount,
            totalCount: academicDataList.length,
          }
        );
      }
    } catch (error) {
      // No lanzar error, solo registrar warning y continuar
      this.logger.warn(
        '[Estudiantes] Error al intentar eliminar datos académicos (continuando con eliminación del estudiante)',
        {
          studentId,
          error: error.message,
          stack: error.stack,
        }
      );
      // No lanzar el error, permitir que continúe la eliminación del estudiante
    }
  }
}
