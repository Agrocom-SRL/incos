import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: ListAvancesProyectoUseCase (T18)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Lista los archivos de avance del proyecto (del más reciente al más antiguo).
 */
export class ListAvancesProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.avanceProyectoRepository
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoRepository, avanceProyectoRepository, logger }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.avanceProyectoRepository = avanceProyectoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @returns {Promise<{avances: Array, total: number}>}
   */
  async execute(proyectoGradoId) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);
    const avances = await this.avanceProyectoRepository.findByProyectoGradoId(proyectoGradoId);

    this.logger.info('[Tutorías] Avances del proyecto listados', {
      proyectoGradoId,
      total: avances.length,
    });

    return { avances, total: avances.length };
  }
}
