/**
 * Use Case: DeletePaymentAporteUseCase
 * Módulo: Pagos
 * Elimina un pago de aporte por ID (soft delete) y sus documentos asociados
 *
 * Responsabilidades:
 * - Validar que el pago exista
 * - Validar que el pago NO esté vinculado a una inscripción
 * - Buscar y eliminar documentos de tipo 'PAGO' asociados (recibo PDF y documento de respaldo)
 * - Eliminar archivos físicos del sistema de archivos
 * - Eliminar registros de entregas de documentos relacionados
 * - Eliminar registros de documentos en BD (soft delete)
 * - Ejecutar soft delete del pago solo si no está vinculado
 *
 * Regla de negocio: Solo se pueden eliminar pagos que NO tengan inscripción asociada.
 * Los pagos vinculados a inscripciones no se eliminan (CreateEnrollmentUseCase los usa).
 *
 * Tablas afectadas (según RegisterAporteVoluntarioUseCase):
 * - pago_aporte: Registro principal del pago
 * - pago_cuotas: Cuotas/abonos vinculados al pago (pago_aporte_id); se eliminan antes que la cabecera
 * - documentos_estudiante: Recibo PDF generado y documento de respaldo (tipo_documento: 'PAGO')
 * - estudiantes_documentos_entrega: Registro de entrega del documento de respaldo
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la eliminación de un pago
 * - Depende de: ContributionPaymentRepository, ContributionPaymentInstallmentRepository, StudentDocumentRepository, StudentDocumentDeliveryRepository
 */

import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serverConfig } from '../../../infrastructure/config/server.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DeletePaymentAporteUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {ContributionPaymentRepository} dependencies.contributionPaymentRepository - Repositorio de pagos (pago_aporte)
   * @param {Object} dependencies.contributionPaymentInstallmentRepository - Repositorio de cuotas (pago_cuotas)
   * @param {Object} dependencies.studentDocumentRepository - Repositorio de documentos de estudiantes
   * @param {Object} dependencies.studentDocumentDeliveryRepository - Repositorio de entregas de documentos
   * @param {ILogger} dependencies.logger - Logger para registro de eventos
   */
  constructor({
    contributionPaymentRepository,
    contributionPaymentInstallmentRepository,
    studentDocumentRepository,
    studentDocumentDeliveryRepository,
    logger,
  }) {
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.contributionPaymentInstallmentRepository = contributionPaymentInstallmentRepository;
    this.studentDocumentRepository = studentDocumentRepository;
    this.studentDocumentDeliveryRepository = studentDocumentDeliveryRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta la eliminación del pago
   *
   * @param {number} paymentId - ID del pago a eliminar
   * @returns {Promise<void>}
   * @throws {NotFoundError} Si el pago no existe
   * @throws {ValidationError} Si el pago está vinculado a una inscripción
   */
  async execute(paymentId) {
    try {
      this.logger.info('[Pagos] Iniciando eliminación de pago', { paymentId });

      // 1. Verificar que el pago existe
      const payment = await this.contributionPaymentRepository.findById(paymentId);

      if (!payment) {
        throw new NotFoundError(`Pago con ID ${paymentId} no encontrado`);
      }

      const paymentPlain = payment.toPlainObject ? payment.toPlainObject() : payment;
      const enrollmentId = paymentPlain.enrollmentId ?? paymentPlain.enrollment_id ?? paymentPlain.inscripcionId
        ?? paymentPlain.inscripcion_id;
      const studentId = paymentPlain.studentId ?? paymentPlain.student_id ?? paymentPlain.estudianteId;
      const paymentDate = paymentPlain.paymentDate ?? paymentPlain.fecha_pago ?? paymentPlain.fechaPago;
      const concept = paymentPlain.concept ?? paymentPlain.concepto;
      const receiptNumber =
        paymentPlain.receiptNumber ?? paymentPlain.numero_recibo ?? paymentPlain.numeroRecibo;

      // 2. Validar que el pago NO esté vinculado a una inscripción
      if (enrollmentId != null && enrollmentId !== '') {
        this.logger.warn('[Pagos] Intento de eliminar pago vinculado a inscripción', {
          paymentId,
          enrollmentId,
        });
        throw new ValidationError(
          'No se puede eliminar el pago porque está vinculado a una inscripción. ' +
            'Solo se pueden eliminar pagos que no tengan inscripción asociada.'
        );
      }

      // 3. Eliminar cuotas (pago_cuotas) vinculadas a este pago_aporte
      await this._deletePaymentInstallments(paymentId);

      // 4. Buscar y eliminar documentos de tipo 'PAGO' asociados al estudiante
      // Incluye: recibo PDF generado y documento de respaldo subido
      if (studentId) {
        await this._deletePaymentDocuments(studentId, paymentDate, concept, receiptNumber);
      }

      // 5. Ejecutar eliminación del pago principal (soft delete)
      const deleted = await this.contributionPaymentRepository.delete(paymentId);

      if (!deleted) {
        throw new NotFoundError(`No se pudo eliminar el pago con ID ${paymentId}`);
      }

      this.logger.info('[Pagos] Pago eliminado exitosamente', {
        paymentId,
        studentId,
        receiptNumber: paymentPlain.receiptNumber ?? paymentPlain.numero_recibo ?? paymentPlain.numeroRecibo,
      });
    } catch (error) {
      this.logger.error('[Pagos] Error al eliminar pago', {
        paymentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Día calendario (AAAA-MM-DD) de una fecha. Las cadenas de solo fecha o sin zona horaria se
   * toman tal cual; `new Date('2026-03-10')` se interpreta como UTC y en Bolivia (UTC-4)
   * caería en el día anterior.
   *
   * @private
   * @param {string|Date|null|undefined} value
   * @returns {string|null}
   */
  _dayKey(value) {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(?!.*(Z|[+-]\d{2}:?\d{2})$)/.test(value)) {
      return value.slice(0, 10);
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  /**
   * Elimina las cuotas (pago_cuotas) vinculadas al pago_aporte por pago_aporte_id.
   * Ejecuta soft delete de cada cuota antes de eliminar la cabecera.
   *
   * @private
   * @param {number} paymentId - ID del pago_aporte (cabecera)
   */
  async _deletePaymentInstallments(paymentId) {
    try {
      const result = await this.contributionPaymentInstallmentRepository.findAll(
        { contributionPaymentId: paymentId },
        null,
        null
      );
      const collectionName = this.contributionPaymentInstallmentRepository.getCollectionName
        ? this.contributionPaymentInstallmentRepository.getCollectionName()
        : 'contributionPaymentInstallments';
      const installments = result[collectionName] || result.contributionPaymentInstallments || [];

      if (installments.length === 0) {
        this.logger.info('[Pagos] No se encontraron cuotas vinculadas al pago para eliminar', {
          paymentId,
        });
        return;
      }

      for (const installment of installments) {
        const plain = installment.toPlainObject ? installment.toPlainObject() : installment;
        const id = plain.id;
        if (id) {
          await this.contributionPaymentInstallmentRepository.delete(id);
          this.logger.info('[Pagos] Cuota de pago eliminada (soft delete)', { paymentId, installmentId: id });
        }
      }

      this.logger.info('[Pagos] Cuotas del pago eliminadas', {
        paymentId,
        cuotasEliminadas: installments.length,
      });
    } catch (error) {
      this.logger.error('[Pagos] Error al eliminar cuotas del pago', {
        paymentId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Elimina los documentos de tipo 'PAGO' asociados al estudiante
   * Incluye: recibo PDF generado y documento de respaldo subido
   * También elimina los registros de entregas de documentos relacionados
   *
   * @private
   * @param {number} studentId - ID del estudiante
   * @param {string} paymentDate - Fecha del pago (para relacionar entregas)
   * @param {string} concept - Concepto del pago (para relacionar entregas)
   */
  async _deletePaymentDocuments(studentId, paymentDate, concept, receiptNumber) {
    try {
      // Buscar documentos de tipo 'PAGO' del estudiante
      const documentosResult = await this.studentDocumentRepository.findAll(
        {
          studentId,
          tipoDocumento: 'PAGO',
        },
        null,
        null
      );

      const documentos = documentosResult.studentDocuments || documentosResult.documentos || [];

      if (documentos.length === 0) {
        this.logger.info('[Pagos] No se encontraron documentos de pago para eliminar', {
          studentId,
        });
        return;
      }

      // Filtrar documentos que corresponden a este pago específico
      // Los documentos de pago se crean en la misma fecha que el pago
      // Usar la fecha de creación del documento para relacionarlo con el pago
      const paymentDay = this._dayKey(paymentDate);
      const documentosDelPago = documentos.filter((documento) => {
        const docPlain = documento.toPlainObject ? documento.toPlainObject() : documento;
        const fechaCreacion = docPlain.createdAt || docPlain.created_at;

        const fileName = docPlain.fileName || docPlain.nombre_archivo || '';
        // Los recibos PDF tienen formato: RECIBO_PAGO_{CI}_{numeroRecibo}_{timestamp}.pdf:
        // se identifican por el número exacto del recibo de ESTE pago.
        if (receiptNumber != null && receiptNumber !== '' && fileName.includes('RECIBO_PAGO_')) {
          if (fileName.includes(`_${receiptNumber}_`)) return true;
        }

        // Otros documentos de respaldo: solo si se creó el mismo día que el pago.
        // Sin fecha del pago o del documento NO se borra (antes se borraban todos).
        const docDay = this._dayKey(fechaCreacion);
        if (!paymentDay || !docDay) return false;

        return paymentDay === docDay && !fileName.includes('RECIBO_PAGO_');
      });

      if (documentosDelPago.length === 0) {
        this.logger.info('[Pagos] No se encontraron documentos de pago relacionados con esta fecha para eliminar', {
          studentId,
          paymentDate,
        });
        // Aún así eliminar las entregas por si acaso
        await this._deletePaymentDocumentDeliveries(studentId, paymentDate, concept);
        return;
      }

      // Eliminar cada documento relacionado con el pago (tanto de BD como archivo físico)
      for (const documento of documentosDelPago) {
        const docPlain = documento.toPlainObject ? documento.toPlainObject() : documento;
        const filePath = docPlain.filePath || docPlain.rutaArchivo || docPlain.ruta_archivo;
        const docId = docPlain.id;

        // Eliminar archivo físico si existe
        if (filePath) {
          await this._deletePhysicalFile(filePath);
        }

        // Eliminar registro de BD (soft delete)
        if (docId) {
          await this.studentDocumentRepository.delete(docId);
          this.logger.info('[Pagos] Documento de pago eliminado de BD', {
            studentId,
            documentId: docId,
            filePath,
          });
        }
      }

      // Buscar y eliminar entregas de documentos relacionadas con el pago
      // Las entregas de pago tienen documentacionId: null y observaciones que mencionan el concepto
      await this._deletePaymentDocumentDeliveries(studentId, paymentDate, concept);

      this.logger.info('[Pagos] Documentos de pago eliminados', {
        studentId,
        documentosEliminados: documentosDelPago.length,
        documentosTotales: documentos.length,
      });
    } catch (error) {
      this.logger.error('[Pagos] Error al eliminar documentos de pago', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      // No lanzar error para no interrumpir la eliminación del pago
      // Solo loguear el error
    }
  }

  /**
   * Elimina los registros de entregas de documentos relacionados con el pago
   * Las entregas de pago tienen documentacionId: null y observaciones que mencionan "Comprobante de pago"
   *
   * @private
   * @param {number} studentId - ID del estudiante
   * @param {string} paymentDate - Fecha del pago
   * @param {string} concept - Concepto del pago
   */
  async _deletePaymentDocumentDeliveries(studentId, paymentDate, concept) {
    try {
      // Buscar entregas con documentacionId: null (característico de pagos)
      const deliveriesResult = await this.studentDocumentDeliveryRepository.findAll(
        {
          studentId,
          documentacionId: null,
        },
        null,
        null
      );

      const deliveries = deliveriesResult.studentDocumentDeliveries || deliveriesResult.documentDeliveries || [];

      if (deliveries.length === 0) {
        this.logger.info('[Pagos] No se encontraron entregas de documentos de pago para eliminar', {
          studentId,
        });
        return;
      }

      // Filtrar entregas que corresponden a este pago específico
      // Las entregas de pago tienen:
      // - documentacionId: null (característico de pagos)
      // - observaciones que mencionan "Comprobante de pago de aporte académico"
      // - fechaEntrega que coincide con la fecha del pago
      const paymentDeliveries = deliveries.filter((delivery) => {
        const deliveryPlain = delivery.toPlainObject ? delivery.toPlainObject() : delivery;
        const observaciones = (deliveryPlain.observaciones || '').toLowerCase();
        const fechaEntrega = deliveryPlain.fechaEntrega || deliveryPlain.fecha_entrega;

        // Verificar si las observaciones mencionan "comprobante de pago" (característico de pagos)
        const mentionsPayment = observaciones.includes('comprobante de pago');

        // Verificar si la fecha de entrega coincide con la fecha del pago (más preciso)
        const dateMatches = paymentDate && fechaEntrega && fechaEntrega === paymentDate;

        // Si hay concepto, también verificar que las observaciones lo mencionen
        const conceptMatches =
          concept && observaciones.includes(concept.toLowerCase());

        // La entrega corresponde a este pago si:
        // 1. Menciona "comprobante de pago" Y (la fecha coincide O el concepto coincide)
        return mentionsPayment && (dateMatches || conceptMatches || !paymentDate);
      });

      // Eliminar cada entrega relacionada con el pago
      for (const delivery of paymentDeliveries) {
        const deliveryPlain = delivery.toPlainObject ? delivery.toPlainObject() : delivery;
        const deliveryId = deliveryPlain.id;

        if (deliveryId) {
          await this.studentDocumentDeliveryRepository.delete(deliveryId);
          this.logger.info('[Pagos] Entrega de documento de pago eliminada', {
            studentId,
            deliveryId,
          });
        }
      }

      this.logger.info('[Pagos] Entregas de documentos de pago eliminadas', {
        studentId,
        entregasEliminadas: paymentDeliveries.length,
      });
    } catch (error) {
      this.logger.error('[Pagos] Error al eliminar entregas de documentos de pago', {
        studentId,
        error: error.message,
        stack: error.stack,
      });
      // No lanzar error para no interrumpir la eliminación del pago
      // Solo loguear el error
    }
  }

  /**
   * Elimina un archivo físico del sistema de archivos
   * @private
   * @param {string} filePath - Ruta relativa del archivo (ej: documentos/estudiantes/1/pagos/archivo.pdf)
   */
  async _deletePhysicalFile(filePath) {
    try {
      // Construir ruta absoluta
      const uploadDir = serverConfig.uploadsPath || 'uploads';
      let absolutePath;

      if (path.isAbsolute(uploadDir)) {
        // Si uploadDir es absoluto, usar directamente
        absolutePath = path.join(uploadDir, filePath.replace(/^\//, ''));
      } else {
        // Si es relativo, construir desde el directorio del proyecto
        absolutePath = path.resolve(__dirname, '../../../..', uploadDir, filePath.replace(/^\//, ''));
      }

      // Verificar que el archivo existe antes de intentar eliminarlo
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        this.logger.info('[Pagos] Archivo físico eliminado', {
          filePath,
          absolutePath,
        });
      } else {
        this.logger.warn('[Pagos] Archivo físico no encontrado (puede haber sido eliminado previamente)', {
          filePath,
          absolutePath,
        });
      }
    } catch (error) {
      this.logger.error('[Pagos] Error al eliminar archivo físico', {
        filePath,
        error: error.message,
        stack: error.stack,
      });
      // No lanzar error para no interrumpir la eliminación
      // Solo loguear el error
    }
  }
}
