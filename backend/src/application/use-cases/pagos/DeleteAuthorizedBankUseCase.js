import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: DeleteAuthorizedBankUseCase
 * Módulo: Pagos — Configuración de pagos
 *
 * Elimina (soft-delete) un banco autorizado.
 */
export class DeleteAuthorizedBankUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.authorizedBankRepository - Repositorio de bancos autorizados
   * @param {Object} params.logger
   */
  constructor({ authorizedBankRepository, logger }) {
    this.authorizedBankRepository = authorizedBankRepository;
    this.logger = logger;
  }

  async execute(id, userId = null) {
    const ok = await this.authorizedBankRepository.delete(id, userId);
    if (!ok) throw new NotFoundError('banco autorizado');
    this.logger.info('Banco autorizado eliminado', { id });
    return true;
  }
}
