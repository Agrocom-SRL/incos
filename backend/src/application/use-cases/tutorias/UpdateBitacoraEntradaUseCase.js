import { NotFoundError } from '../../../domain/errors/AppError.js';
import {
  ESTADOS_BITACORA_TUTORIA,
  ESTADOS_REVISION_AVANCE,
} from '../../../domain/constants/tutorias.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';
import { hoyISO } from './helpers/dictamenPdfHelpers.js';

/**
 * Use Case: UpdateBitacoraEntradaUseCase (T16)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Actualiza una entrada de bitácora del proyecto. Si la entrada pasa a
 * SUBSANADO y está vinculada a un avance, sincroniza
 * tutoria_avances.estado_revision = SUBSANADO en la misma transacción.
 */
export class UpdateBitacoraEntradaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.tutoriaBitacoraRepository
   * @param {Object} params.tutoriaAvanceRepository
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoRepository, tutoriaBitacoraRepository, tutoriaAvanceRepository, logger }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.tutoriaBitacoraRepository = tutoriaBitacoraRepository;
    this.tutoriaAvanceRepository = tutoriaAvanceRepository;
    this.logger = logger;
  }

  /**
   * @param {number} proyectoGradoId
   * @param {number} entradaId
   * @param {Object} body - { fecha?, actividad?, observaciones?, porcentajeAvance?, estado? }
   * @param {number|null} userId
   * @returns {Promise<{bitacoraEntrada: Object}>}
   */
  async execute(proyectoGradoId, entradaId, body = {}, userId = null) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const entrada = await this.tutoriaBitacoraRepository.findById(entradaId);
    if (!entrada || Number(entrada.proyectoGradoId) !== Number(proyectoGradoId)) {
      throw new NotFoundError(
        `entrada de bitácora con ID ${entradaId} del proyecto ${proyectoGradoId}`
      );
    }

    const data = {};
    if ('fecha' in body) data.fecha = body.fecha;
    if ('actividad' in body) data.actividad = body.actividad;
    if ('observaciones' in body) data.observaciones = body.observaciones;
    if ('porcentajeAvance' in body) data.porcentajeAvance = body.porcentajeAvance;
    if ('estado' in body) data.estado = body.estado;

    const pasaASubsanado =
      body.estado === ESTADOS_BITACORA_TUTORIA.SUBSANADO &&
      entrada.estado !== ESTADOS_BITACORA_TUTORIA.SUBSANADO &&
      entrada.tutoriaAvanceId != null;

    let bitacoraEntrada = null;
    await sequelize.transaction(async (transaction) => {
      bitacoraEntrada = await this.tutoriaBitacoraRepository.update(entradaId, data, userId, {
        transaction,
      });

      if (pasaASubsanado) {
        await this.tutoriaAvanceRepository.update(
          entrada.tutoriaAvanceId,
          { estadoRevision: ESTADOS_REVISION_AVANCE.SUBSANADO, fechaRevision: hoyISO() },
          userId,
          { transaction }
        );
      }
    });

    this.logger.info('[Tutorías] Entrada de bitácora actualizada', {
      proyectoGradoId,
      entradaId,
      campos: Object.keys(data),
    });

    return { bitacoraEntrada };
  }
}
