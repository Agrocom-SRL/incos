import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import {
  TIPOS_BITACORA_TUTORIA,
  ESTADOS_BITACORA_TUTORIA,
  ESTADOS_REVISION_AVANCE,
  ESTADOS_REVISION_AVANCE_VALUES,
} from '../../../domain/constants/tutorias.constants.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';
import { hoyISO } from './helpers/dictamenPdfHelpers.js';

/**
 * Use Case: CreateBitacoraEntradaUseCase (T15)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Crea una entrada de bitácora del proyecto. Si tipo = REVISION_AVANCE:
 * - requiere tutoriaAvanceId de un avance del MISMO proyecto, y
 * - actualiza tutoria_avances.estado_revision (body.estadoRevisionAvance,
 *   default OBSERVADO) + fecha_revision, en la misma transacción.
 */
export class CreateBitacoraEntradaUseCase {
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
   * @param {Object} body - { tipo?, fecha?, actividad?, observaciones?,
   *   porcentajeAvance?, tutoriaAvanceId?, estadoRevisionAvance? }
   * @param {number|null} userId
   * @returns {Promise<{bitacoraEntrada: Object}>}
   */
  async execute(proyectoGradoId, body = {}, userId = null) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const tipo = body.tipo ?? TIPOS_BITACORA_TUTORIA.REUNION;
    const esRevision = tipo === TIPOS_BITACORA_TUTORIA.REVISION_AVANCE;

    let avance = null;
    if (esRevision) {
      if (!body.tutoriaAvanceId) {
        throw new ValidationError('tutoriaAvanceId es requerido para entradas de tipo REVISION_AVANCE');
      }
      avance = await this.tutoriaAvanceRepository.findById(Number(body.tutoriaAvanceId));
      if (!avance || Number(avance.proyectoGradoId) !== Number(proyectoGradoId)) {
        throw new NotFoundError(
          `avance con ID ${body.tutoriaAvanceId} del proyecto ${proyectoGradoId}`
        );
      }
    }

    const estadoRevisionAvance = body.estadoRevisionAvance ?? ESTADOS_REVISION_AVANCE.OBSERVADO;
    if (esRevision && !ESTADOS_REVISION_AVANCE_VALUES.includes(estadoRevisionAvance)) {
      throw new ValidationError(
        `estadoRevisionAvance debe ser uno de: ${ESTADOS_REVISION_AVANCE_VALUES.join(', ')}`
      );
    }

    const fecha = body.fecha ?? hoyISO();
    let bitacoraEntrada = null;

    await sequelize.transaction(async (transaction) => {
      bitacoraEntrada = await this.tutoriaBitacoraRepository.create(
        {
          proyectoGradoId,
          tutoriaAvanceId: esRevision ? Number(body.tutoriaAvanceId) : null,
          tipo,
          fecha,
          actividad: body.actividad ?? null,
          observaciones: body.observaciones ?? null,
          porcentajeAvance: body.porcentajeAvance ?? null,
          estado: body.estado ?? ESTADOS_BITACORA_TUTORIA.PENDIENTE,
        },
        userId,
        { transaction }
      );

      if (esRevision) {
        await this.tutoriaAvanceRepository.update(
          avance.id,
          { estadoRevision: estadoRevisionAvance, fechaRevision: fecha },
          userId,
          { transaction }
        );
      }
    });

    this.logger.info('[Tutorías] Entrada de bitácora creada', {
      proyectoGradoId,
      entradaId: bitacoraEntrada.id,
      tipo,
    });

    return { bitacoraEntrada };
  }
}
