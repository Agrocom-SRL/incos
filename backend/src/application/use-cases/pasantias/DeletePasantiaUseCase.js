import { getPasantiaOrFail } from './helpers/pasantiaGuards.js';

/**
 * Use Case: DeletePasantiaUseCase (P5)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Elimina (soft) el trámite de pasantía. Los satélites (informes,
 * seguimientos) conservan sus filas; la vista 166 los excluye al filtrar el
 * trámite raíz.
 */
export class DeletePasantiaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaRepository, logger }) {
    this.pasantiaRepository = pasantiaRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {number|null} userId - Usuario de la sesión (auditoría deleted_by)
   * @returns {Promise<void>}
   */
  async execute(id, userId = null) {
    await getPasantiaOrFail(this.pasantiaRepository, id);
    await this.pasantiaRepository.delete(id, userId);

    this.logger.info('[Pasantías] Trámite eliminado (soft)', { id });
  }
}
