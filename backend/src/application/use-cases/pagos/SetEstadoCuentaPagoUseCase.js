import { NotFoundError } from '../../../domain/errors/AppError.js';
import { PaymentAccountMapper } from '../../mappers/pagos/index.js';
import { parseBooleano } from '../../utils/validacionEntrada.js';

/**
 * Use Case: SetEstadoCuentaPagoUseCase
 * Módulo: Pagos — Configuración de pagos
 * Activa/desactiva una cuenta de pago (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoCuentaPagoUseCase {
  constructor({ paymentAccountRepository, logger }) {
    this.paymentAccountRepository = paymentAccountRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID de la cuenta de pago
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{cuentaPago: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.paymentAccountRepository.findById(id);
    if (!existing) throw new NotFoundError('cuenta de pago');

    const estado = parseBooleano(activo, 'activo');
    const updated = await this.paymentAccountRepository.update(id, { active: estado }, userId);

    this.logger.info('[Pagos] Estado de cuenta de pago actualizado', { id, activo: estado });
    return { cuentaPago: PaymentAccountMapper.entityToPresentation(updated) };
  }
}
