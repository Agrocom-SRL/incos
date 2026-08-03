import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: ListBitacoraProyectoUseCase (T14)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Lista las entradas de bitácora de un proyecto (planilla de seguimiento:
 * FECHA/ACTIVIDAD/OBSERVACIONES/confirmación del estudiante), cronológicas
 * descendentes.
 */
export class ListBitacoraProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.bitacoraProyectoRepository
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoRepository, bitacoraProyectoRepository, logger }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.bitacoraProyectoRepository = bitacoraProyectoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @returns {Promise<{bitacoraEntradas: Array, total: number}>}
   */
  async execute(proyectoGradoId) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);
    const bitacoraEntradas =
      await this.bitacoraProyectoRepository.findByProyectoGradoId(proyectoGradoId);

    this.logger.info('[Tutorías] Bitácora del proyecto listada', {
      proyectoGradoId,
      total: bitacoraEntradas.length,
    });

    return { bitacoraEntradas, total: bitacoraEntradas.length };
  }
}
