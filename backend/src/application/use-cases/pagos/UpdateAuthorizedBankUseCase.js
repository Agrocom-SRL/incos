import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: UpdateAuthorizedBankUseCase
 * Módulo: Pagos — Configuración de pagos
 *
 * Edita un banco autorizado: nombre, codigo, metodoPagoId y/o estado activo.
 * El "eliminar" se hace togglando `activo` por PUT (no hay borrado físico).
 */
export class UpdateAuthorizedBankUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.authorizedBankRepository - Repositorio de bancos autorizados
   * @param {Object} params.logger
   */
  constructor({ authorizedBankRepository, logger }) {
    this.authorizedBankRepository = authorizedBankRepository;
    this.logger = logger;
  }

  /**
   * @param {number|string} id
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<Object>} banco actualizado (entidad)
   */
  async execute(id, body = {}, userId = null) {
    const bankId = this._parseId(id);

    const existing = await this.authorizedBankRepository.findById(bankId);
    if (!existing) {
      throw new NotFoundError(`Banco autorizado con ID ${bankId}`);
    }

    const payload = {};

    const codigo = body.codigo ?? body.code;
    if (codigo !== undefined) {
      const trimmed = String(codigo).trim();
      if (trimmed === '') {
        throw new ValidationError('codigo no puede ser vacío');
      }
      payload.code = trimmed;
    }

    const nombre = body.nombre ?? body.name;
    if (nombre !== undefined) {
      const trimmed = String(nombre).trim();
      if (trimmed === '') {
        throw new ValidationError('nombre no puede ser vacío');
      }
      payload.name = trimmed;
    }

    const metodoPagoId = body.metodo_pago_id ?? body.metodoPagoId ?? body.paymentMethodId;
    if (metodoPagoId !== undefined) {
      payload.paymentMethodId = metodoPagoId != null && metodoPagoId !== '' ? Number(metodoPagoId) : null;
    }

    const activo = body.activo ?? body.active;
    if (activo !== undefined) {
      payload.active = Boolean(activo);
    }

    if (Object.keys(payload).length === 0) {
      throw new ValidationError('No se enviaron campos para actualizar');
    }

    const updated = await this.authorizedBankRepository.update(bankId, payload, userId);

    this.logger?.info?.('[Pagos] Banco autorizado actualizado', {
      id: bankId,
      campos: Object.keys(payload),
    });

    return updated;
  }

  _parseId(raw) {
    const id = parseInt(String(raw), 10);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError('id de banco autorizado inválido');
    }
    return id;
  }
}
