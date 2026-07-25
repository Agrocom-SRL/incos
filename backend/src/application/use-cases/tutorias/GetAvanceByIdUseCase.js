import { NotFoundError } from '../../../domain/errors/AppError.js';
import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: GetAvanceByIdUseCase (T19)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Detalle de un avance del proyecto + su historial de revisiones (entradas de
 * bitácora vinculadas al avance).
 */
export class GetAvanceByIdUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.tutoriaAvanceRepository
   * @param {Object} params.tutoriaBitacoraRepository
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoRepository,
    tutoriaAvanceRepository,
    tutoriaBitacoraRepository,
    logger,
  }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.tutoriaAvanceRepository = tutoriaAvanceRepository;
    this.tutoriaBitacoraRepository = tutoriaBitacoraRepository;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @param {number} avanceId
   * @returns {Promise<{avance: Object}>}
   */
  async execute(proyectoGradoId, avanceId) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const avance = await this.tutoriaAvanceRepository.findById(avanceId);
    if (!avance || Number(avance.proyectoGradoId) !== Number(proyectoGradoId)) {
      throw new NotFoundError(`avance con ID ${avanceId} del proyecto ${proyectoGradoId}`);
    }

    const revisionesResult = await this.tutoriaBitacoraRepository.findAll({
      tutoriaAvanceId: avanceId,
    });
    avance.revisiones = revisionesResult.bitacoraEntradas ?? [];

    this.logger.info('[Tutorías] Detalle de avance obtenido', {
      proyectoGradoId,
      avanceId,
      revisiones: avance.revisiones.length,
    });

    return { avance };
  }
}
