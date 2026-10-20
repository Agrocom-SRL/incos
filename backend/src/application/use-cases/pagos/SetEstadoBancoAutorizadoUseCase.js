import { NotFoundError } from '../../../domain/errors/AppError.js';
import { AuthorizedBankMapper } from '../../mappers/pagos/index.js';
import { parseBooleano } from '../../utils/validacionEntrada.js';

/**
 * Use Case: SetEstadoBancoAutorizadoUseCase
 * Módulo: Pagos — Configuración de pagos
 * Activa/desactiva un banco autorizado (solo el campo `activo`).
 *
 * NOTA: findById NO filtra por activo (solo excluye soft-deleted vía paranoid),
 * por lo que también funciona sobre ítems inactivos (reactivar).
 */
export class SetEstadoBancoAutorizadoUseCase {
  constructor({ authorizedBankRepository, logger }) {
    this.authorizedBankRepository = authorizedBankRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del banco autorizado
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario que realiza el cambio (updatedBy)
   * @returns {Promise<{bancoAutorizado: Object}>} Ítem actualizado en formato de presentación
   */
  async execute(id, activo, userId = null) {
    const existing = await this.authorizedBankRepository.findById(id);
    if (!existing) throw new NotFoundError('banco autorizado');

    const estado = parseBooleano(activo, 'activo');
    const updated = await this.authorizedBankRepository.update(id, { active: estado }, userId);

    this.logger.info('[Pagos] Estado de banco autorizado actualizado', { id, activo: estado });
    return { bancoAutorizado: AuthorizedBankMapper.entityToPresentation(updated) };
  }
}
