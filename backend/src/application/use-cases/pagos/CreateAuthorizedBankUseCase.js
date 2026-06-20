import { ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: CreateAuthorizedBankUseCase
 * Módulo: Pagos — Configuración de pagos
 *
 * Crea un banco autorizado (metodoPagoId, codigo, nombre).
 */
export class CreateAuthorizedBankUseCase {
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
   * @param {Object} body
   * @param {number|null} userId
   * @returns {Promise<Object>} banco creado (entidad)
   */
  async execute(body = {}, userId = null) {
    const codigo = body.codigo ?? body.code;
    const nombre = body.nombre ?? body.name;

    if (!codigo || String(codigo).trim() === '') {
      throw new ValidationError('codigo es requerido');
    }
    if (!nombre || String(nombre).trim() === '') {
      throw new ValidationError('nombre es requerido');
    }

    const metodoPagoId = body.metodo_pago_id ?? body.metodoPagoId ?? body.paymentMethodId ?? null;

    const created = await this.authorizedBankRepository.create(
      {
        paymentMethodId: metodoPagoId != null && metodoPagoId !== '' ? Number(metodoPagoId) : null,
        code: String(codigo).trim(),
        name: String(nombre).trim(),
        active: body.activo ?? body.active ?? true,
      },
      userId
    );

    this.logger?.info?.('[Pagos] Banco autorizado creado', { id: created.id });
    return created;
  }
}
