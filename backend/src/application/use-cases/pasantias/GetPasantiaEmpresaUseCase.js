import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: GetPasantiaEmpresaUseCase
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Ficha de una empresa del catálogo (pasantias_empresas). Sin vista: la
 * tabla es plana, el repositorio ya expone toEntity con todos los campos.
 */
export class GetPasantiaEmpresaUseCase {
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
   * @returns {Promise<Object>} Ficha de la empresa (presentación camelCase)
   */
  async execute(empresaId) {
    const pasantiaEmpresa = await this.pasantiaEmpresaRepository.findById(empresaId);
    if (!pasantiaEmpresa) {
      throw new NotFoundError(`empresa de pasantía con ID ${empresaId}`);
    }

    this.logger.info('[Pasantías] Ficha de empresa obtenida', { id: empresaId });

    return pasantiaEmpresa;
  }
}
