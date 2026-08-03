import { ValidationError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: CreatePasantiaEmpresaUseCase (P8)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Alta en el catálogo de empresas para práctica laboral (pasantias_empresas).
 * El catálogo arranca vacío y se llena desde este ABM propio.
 */
export class CreatePasantiaEmpresaUseCase {
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
   * @param {Object} data - Payload camelCase de la empresa
   * @param {number|null} userId - Usuario de la sesión (auditoría created_by)
   * @returns {Promise<{pasantiaEmpresa: Object}>}
   */
  async execute(data, userId = null) {
    if (!data.nombre || !String(data.nombre).trim()) {
      throw new ValidationError('nombre de la empresa es requerido');
    }

    const pasantiaEmpresa = await this.pasantiaEmpresaRepository.create(data, userId);

    this.logger.info('[Pasantías] Empresa registrada en el catálogo', {
      id: pasantiaEmpresa.id,
      nombre: pasantiaEmpresa.nombre,
    });

    return { pasantiaEmpresa };
  }
}
