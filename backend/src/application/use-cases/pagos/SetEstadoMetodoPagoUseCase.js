import { NotFoundError } from '../../../domain/errors/AppError.js';
import { PaymentMethodMapper } from '../../mappers/pagos/index.js';

/**
 * Use Case: SetEstadoMetodoPagoUseCase
 * Módulo: Pagos — Configuración de pagos
 * Activa/desactiva un método de pago (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoMetodoPagoUseCase {
  constructor({ paymentMethodRepository, logger }) {
    this.paymentMethodRepository = paymentMethodRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del método de pago
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{metodoPago: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.paymentMethodRepository.findById(id);
    if (!existing) throw new NotFoundError('método de pago');

    const estado = Boolean(activo);
    const updated = await this.paymentMethodRepository.update(id, { active: estado }, userId);

    this.logger.info('[Pagos] Estado de método de pago actualizado', { id, activo: estado });
    return { metodoPago: PaymentMethodMapper.entityToPresentation(updated) };
  }
}
