import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: ListDictamenesProyectoUseCase (T22)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Lista los dictámenes formales del proyecto (VIABILIDAD_TECNICA y
 * DESIGNACION_OFICIAL), del más reciente al más antiguo.
 */
export class ListDictamenesProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.tutoriaDictamenRepository
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoRepository, tutoriaDictamenRepository, logger }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.tutoriaDictamenRepository = tutoriaDictamenRepository;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @returns {Promise<{dictamenes: Array, total: number}>}
   */
  async execute(proyectoGradoId) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);
    const dictamenes = await this.tutoriaDictamenRepository.findByProyectoGradoId(proyectoGradoId);

    this.logger.info('[Tutorías] Dictámenes del proyecto listados', {
      proyectoGradoId,
      total: dictamenes.length,
    });

    // La ruta del archivo NO se expone: la descarga es vía T23 (res.download).
    return {
      dictamenes: dictamenes.map(({ rutaArchivo: _rutaArchivo, ...dictamen }) => dictamen),
      total: dictamenes.length,
    };
  }
}
