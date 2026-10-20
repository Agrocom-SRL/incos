/**
 * Use Case: DeleteStudentScholarshipUseCase
 * Módulo: Estudiantes
 * Elimina una asignación de beca de un estudiante (soft delete)
 *
 * Responsabilidades:
 * - Validar que la beca asignada exista
 * - Validar que la beca NO esté vinculada a un pago vigente
 * - Ejecutar soft delete de la beca solo si no está vinculada a pagos
 *
 * Regla de negocio: Solo se pueden eliminar becas que NO tengan pagos vigentes asociados.
 * Las becas vinculadas a pagos no se eliminan (RegisterAporteVoluntarioUseCase las usa).
 *
 * Tablas afectadas (según CreateStudentScholarshipUseCase):
 * - estudiantes_becas: Registro principal de la asignación de beca
 *
 * Clean Architecture:
 * - Application Layer: Orquesta la eliminación de una beca asignada
 * - Depende de: StudentScholarshipRepository, ContributionPaymentRepository
 */

import { NotFoundError, ValidationError } from '../../../../domain/errors/AppError.js';

export class DeleteStudentScholarshipUseCase {
  /**
   * @param {Object} dependencies - Dependencias inyectadas
   * @param {StudentScholarshipRepository} dependencies.studentScholarshipRepository - Repositorio de becas asignadas
   * @param {ContributionPaymentRepository} dependencies.contributionPaymentRepository - Repositorio de pagos
   * @param {ILogger} dependencies.logger - Logger para registro de eventos
   */
  constructor({
    studentScholarshipRepository,
    contributionPaymentRepository,
    logger,
  }) {
    this.studentScholarshipRepository = studentScholarshipRepository;
    this.contributionPaymentRepository = contributionPaymentRepository;
    this.logger = logger;
  }

  /**
   * Ejecuta la eliminación de la beca asignada
   *
   * @param {number} studentScholarshipId - ID de la beca asignada a eliminar
   * @returns {Promise<void>}
   * @throws {NotFoundError} Si la beca asignada no existe
   * @throws {ValidationError} Si la beca está vinculada a un pago vigente
   */
  async execute(studentScholarshipId) {
    try {
      this.logger.info('[Estudiantes] Iniciando eliminación de beca asignada', {
        studentScholarshipId,
      });

      // 1. Verificar que la beca asignada existe
      const studentScholarship = await this.studentScholarshipRepository.findById(
        studentScholarshipId
      );

      if (!studentScholarship) {
        throw new NotFoundError(
          `Beca asignada con ID ${studentScholarshipId} no encontrada`
        );
      }

      const scholarshipPlain = studentScholarship.toPlainObject
        ? studentScholarship.toPlainObject()
        : studentScholarship;

      // 2. Validar que la beca NO esté vinculada a un pago vigente
      await this._validateNoActivePayments(studentScholarshipId);

      // 3. Ejecutar eliminación (soft delete)
      const deleted = await this.studentScholarshipRepository.delete(
        studentScholarshipId
      );

      if (!deleted) {
        throw new NotFoundError(
          `No se pudo eliminar la beca asignada con ID ${studentScholarshipId}`
        );
      }

      this.logger.info('[Estudiantes] Beca asignada eliminada exitosamente', {
        studentScholarshipId,
        studentId:
          scholarshipPlain.studentId ??
          scholarshipPlain.student_id ??
          scholarshipPlain.estudianteId,
        scholarshipId:
          scholarshipPlain.scholarshipId ??
          scholarshipPlain.scholarship_id ??
          scholarshipPlain.becaDescuentoId ??
          scholarshipPlain.beca_descuento_id,
      });
    } catch (error) {
      this.logger.error('[Estudiantes] Error al eliminar beca asignada', {
        studentScholarshipId,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Valida que la beca NO esté vinculada a un pago vigente
   * Busca pagos activos que tengan estudiante_beca_id = studentScholarshipId
   *
   * @private
   * @param {number} studentScholarshipId - ID de la beca asignada
   * @throws {ValidationError} Si existe un pago vigente vinculado a la beca
   */
  async _validateNoActivePayments(studentScholarshipId) {
    try {
      // Buscar pagos activos vinculados a esta beca
      const paymentsResult = await this.contributionPaymentRepository.findAll(
        {
          studentScholarshipId,
          active: true, // Solo pagos activos (no eliminados)
        },
        null,
        null
      );

      const payments =
        paymentsResult.contributionPayments ||
        paymentsResult.pagos ||
        paymentsResult.payments ||
        [];

      if (payments.length > 0) {
        // Obtener información del primer pago para el mensaje de error
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
          '[Estudiantes] Intento de eliminar beca vinculada a pago vigente',
          {
            studentScholarshipId,
            paymentsCount: payments.length,
            firstPaymentId: paymentPlain.id,
            receiptNumber,
          }
        );

        throw new ValidationError(
          `No se puede eliminar la beca porque está vinculada a ${payments.length} pago(s) vigente(s). ` +
            `Número de recibo: ${receiptNumber || 'N/A'}. ` +
            'Solo se pueden eliminar becas que no tengan pagos asociados.'
        );
      }

      this.logger.info(
        '[Estudiantes] Validación exitosa: la beca no está vinculada a pagos vigentes',
        {
          studentScholarshipId,
        }
      );
    } catch (error) {
      // Si es ValidationError, re-lanzarlo
      if (error instanceof ValidationError) {
        throw error;
      }

      // Para otros errores, loguear y re-lanzar
      this.logger.error(
        '[Estudiantes] Error al validar pagos vinculados a la beca',
        {
          studentScholarshipId,
          error: error.message,
          stack: error.stack,
        }
      );
      throw error;
    }
  }
}
