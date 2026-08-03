import {
  getPasantiaOrFail,
  getSeguimientoOfPasantiaOrFail,
} from './helpers/pasantiaGuards.js';

/**
 * Use Case: UpdateSeguimientoPasantiaUseCase (P17)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Edita un seguimiento del trámite (payload parcial), verificando su
 * pertenencia al trámite (anti-IDOR).
 */
export class UpdateSeguimientoPasantiaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {Object} params.pasantiaSeguimientoRepository - CRUD pasantias_seguimientos
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaRepository, pasantiaSeguimientoRepository, logger }) {
    this.pasantiaRepository = pasantiaRepository;
    this.pasantiaSeguimientoRepository = pasantiaSeguimientoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} pasantiaId
   * @param {number} seguimientoId
   * @param {Object} data - Payload parcial camelCase
   * @param {number|null} userId - Usuario de la sesión (auditoría updated_by)
   * @returns {Promise<{seguimiento: Object}>}
   */
  async execute(pasantiaId, seguimientoId, data, userId = null) {
    await getPasantiaOrFail(this.pasantiaRepository, pasantiaId);
    await getSeguimientoOfPasantiaOrFail(
      this.pasantiaSeguimientoRepository,
      pasantiaId,
      seguimientoId
    );

    // pasantiaId no se reasigna por edición (pertenencia fija del satélite).
    const cambios = { ...(data ?? {}) };
    delete cambios.pasantiaId;
    const seguimiento = await this.pasantiaSeguimientoRepository.update(
      seguimientoId,
      cambios,
      userId
    );

    this.logger.info('[Pasantías] Seguimiento actualizado', { pasantiaId, seguimientoId });

    return { seguimiento };
  }
}
