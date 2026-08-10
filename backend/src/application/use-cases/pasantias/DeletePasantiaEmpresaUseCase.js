import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: DeletePasantiaEmpresaUseCase
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Elimina (soft) una empresa del catálogo. Los trámites que ya la referencian
 * (pasantias.empresa_id) conservan la referencia; la FK es ON DELETE SET NULL
 * pero el soft delete no dispara esa regla (deleted_at, no DELETE físico).
 */
export class DeletePasantiaEmpresaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaEmpresaRepository - CRUD pasantias_empresas
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaEmpresaRepository, logger }) {
    this.pasantiaEmpresaRepository = pasantiaEmpresaRepository;
    this.logger = logger;
  }

  /**
   * @param {number} empresaId
   * @param {number|null} userId - Usuario de la sesión (auditoría deleted_by)
   * @returns {Promise<void>}
   */
  async execute(empresaId, userId = null) {
    const existing = await this.pasantiaEmpresaRepository.findById(empresaId);
    if (!existing) {
      throw new NotFoundError(`empresa de pasantía con ID ${empresaId}`);
    }

    await this.pasantiaEmpresaRepository.delete(empresaId, userId);

    this.logger.info('[Pasantías] Empresa del catálogo eliminada (soft)', { id: empresaId });
  }
}
