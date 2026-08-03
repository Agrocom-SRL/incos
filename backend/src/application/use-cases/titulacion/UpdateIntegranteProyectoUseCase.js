import { NotFoundError } from '../../../domain/errors/AppError.js';
import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: UpdateIntegranteProyectoUseCase (T13)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Actualiza un integrante del proyecto (rol, estado ACTIVO/RETIRADO,
 * observaciones). Valida que el integrante pertenezca al proyecto de la ruta.
 */
export class UpdateIntegranteProyectoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.integranteProyectoRepository
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoRepository, integranteProyectoRepository, logger }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.integranteProyectoRepository = integranteProyectoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @param {number} integranteId
   * @param {Object} body - { rol?, estado?, fechaIncorporacion?, observaciones? }
   * @param {number|null} userId
   * @returns {Promise<{integrante: Object}>}
   */
  async execute(proyectoGradoId, integranteId, body = {}, userId = null) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const integrante = await this.integranteProyectoRepository.findById(integranteId);
    if (!integrante || Number(integrante.proyectoGradoId) !== Number(proyectoGradoId)) {
      throw new NotFoundError(
        `integrante con ID ${integranteId} del proyecto ${proyectoGradoId}`
      );
    }

    const data = {};
    if ('rol' in body) data.rol = body.rol;
    if ('estado' in body) data.estado = body.estado;
    if ('fechaIncorporacion' in body) data.fechaIncorporacion = body.fechaIncorporacion;
    if ('observaciones' in body) data.observaciones = body.observaciones;

    const updated = await this.integranteProyectoRepository.update(integranteId, data, userId);

    this.logger.info('[Tutorías] Integrante del proyecto actualizado', {
      proyectoGradoId,
      integranteId,
      campos: Object.keys(data),
    });

    return { integrante: updated };
  }
}
