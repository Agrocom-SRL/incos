import { NotFoundError } from '../../../domain/errors/AppError.js';

/**
 * Use Case: SetEstadoPasantiaEmpresaUseCase (P10)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Activa/desactiva una empresa del catálogo (solo el campo `activo`). Patrón
 * EstadoTogglePill (SetEstadoActividadUseCase): findById NO filtra por activo,
 * por lo que también funciona sobre empresas inactivas (reactivar).
 */
export class SetEstadoPasantiaEmpresaUseCase {
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
   * @param {boolean} activo - Nuevo estado
   * @param {number|null} userId - Usuario de la sesión (auditoría updated_by)
   * @returns {Promise<{pasantiaEmpresa: Object}>}
   */
  async execute(empresaId, activo, userId = null) {
    const existing = await this.pasantiaEmpresaRepository.findById(empresaId);
    if (!existing) {
      throw new NotFoundError(`empresa de pasantía con ID ${empresaId}`);
    }

    const estado = Boolean(activo);
    const pasantiaEmpresa = await this.pasantiaEmpresaRepository.update(
      empresaId,
      { activo: estado },
      userId
    );

    this.logger.info('[Pasantías] Estado de empresa actualizado', {
      id: empresaId,
      activo: estado,
    });

    return { pasantiaEmpresa };
  }
}
