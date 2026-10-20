import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { parseBooleano } from '../../utils/validacionEntrada.js';

/**
 * Use Case: UpdatePaymentMethodUseCase
 * Módulo: Pagos — Configuración de pagos
 *
 * Edita un método de pago: nombre y/o estado activo. Los códigos son fijos
 * (EFECTIVO, TRANSFERENCIA, DEPOSITO, QR), por eso solo se permite editar el
 * nombre y togglear `activo` (no se crean ni eliminan métodos).
 */
export class UpdatePaymentMethodUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.paymentMethodRepository - Repositorio de métodos de pago
   * @param {Object} params.logger
   */
  constructor({ paymentMethodRepository, logger }) {
    this.paymentMethodRepository = paymentMethodRepository;
    this.logger = logger;
  }

  /**
   * @param {number|string} id
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<Object>} método de pago actualizado (entidad)
   */
  async execute(id, body = {}, userId = null) {
    const methodId = this._parseId(id);

    const existing = await this.paymentMethodRepository.findById(methodId);
    if (!existing) {
      throw new NotFoundError(`Método de pago con ID ${methodId}`);
    }

    const payload = {};

    const nombre = body.nombre ?? body.name;
    if (nombre !== undefined) {
      const trimmed = String(nombre).trim();
      if (trimmed === '') {
        throw new ValidationError('nombre no puede ser vacío');
      }
      payload.name = trimmed;
    }

    const activo = body.activo ?? body.active;
    if (activo !== undefined) {
      payload.active = parseBooleano(activo, 'activo');
    }

    if (Object.keys(payload).length === 0) {
      throw new ValidationError('No se enviaron campos para actualizar');
    }

    const updated = await this.paymentMethodRepository.update(methodId, payload, userId);

    this.logger?.info?.('[Pagos] Método de pago actualizado', {
      id: methodId,
      campos: Object.keys(payload),
    });

    return updated;
  }

  _parseId(raw) {
    const id = parseInt(String(raw), 10);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError('id de método de pago inválido');
    }
    return id;
  }
}
