import { getPasantiaOrFail } from './helpers/pasantiaGuards.js';

/**
 * Use Case: ListInformesPasantiaUseCase (P11)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Lista los informes formales del trámite (VERIFICACION_EMPRESA o
 * CONVALIDACION_TRABAJO), del más reciente al más antiguo.
 */
export class ListInformesPasantiaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {Object} params.pasantiaInformeRepository - CRUD pasantias_informes
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaRepository, pasantiaInformeRepository, logger }) {
    this.pasantiaRepository = pasantiaRepository;
    this.pasantiaInformeRepository = pasantiaInformeRepository;
    this.logger = logger;
  }

  /**
   * @param {number} pasantiaId
   * @returns {Promise<{informes: Array, total: number}>}
   */
  async execute(pasantiaId) {
    await getPasantiaOrFail(this.pasantiaRepository, pasantiaId);
    const informes = await this.pasantiaInformeRepository.findByPasantiaId(pasantiaId);

    this.logger.info('[Pasantías] Informes del trámite listados', {
      pasantiaId,
      total: informes.length,
    });

    // La ruta del archivo NO se expone: la descarga es vía GET .../pdf (res.download).
    return {
      informes: informes.map(({ rutaArchivo: _rutaArchivo, ...informe }) => informe),
      total: informes.length,
    };
  }
}
