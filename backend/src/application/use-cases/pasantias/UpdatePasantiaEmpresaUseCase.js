import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: UpdatePasantiaEmpresaUseCase (P9)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Edita una empresa del catálogo (payload parcial). El estado activo NO se
 * edita aquí: va por SetEstadoPasantiaEmpresaUseCase (PATCH /estado).
 */
export class UpdatePasantiaEmpresaUseCase {
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
   * @param {Object} data - Payload parcial camelCase
   * @param {number|null} userId - Usuario de la sesión (auditoría updated_by)
   * @returns {Promise<{pasantiaEmpresa: Object}>}
   */
  async execute(empresaId, data, userId = null) {
    const existing = await this.pasantiaEmpresaRepository.findById(empresaId);
    if (!existing) {
      throw new NotFoundError(`empresa de pasantía con ID ${empresaId}`);
    }

    const pasantiaEmpresa = await this.pasantiaEmpresaRepository.update(empresaId, data, userId);

    this.logger.info('[Pasantías] Empresa del catálogo actualizada', { id: empresaId });

    return { pasantiaEmpresa };
  }
}
