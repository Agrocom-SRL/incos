import { ConflictError, ValidationError } from '../../../domain/errors/AppError.js';
import { ParticipanteMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: CreateParticipanteUseCase
 * Módulo: Capacitación (CAP)
 *
 * Crea un participante de cursos de capacitación. Valida la unicidad de
 * negocio CI + expedición (sin UNIQUE en BD, mismo criterio que estudiantes:
 * la identidad real depende de ambos campos y se resuelve aquí).
 */
export class CreateParticipanteUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.participanteRepository
   * @param {ILogger} params.logger
   */
  constructor({ participanteRepository, logger }) {
    this.participanteRepository = participanteRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} body - Datos del participante
   * @param {number|null} userId - Usuario que crea (auditoría)
   * @returns {Promise<{participante: Object}>}
   */
  async execute(body = {}, userId = null) {
    if (!body.ci || String(body.ci).trim() === '') {
      throw new ValidationError('ci es requerido');
    }
    if (!body.nombres || String(body.nombres).trim() === '') {
      throw new ValidationError('nombres es requerido');
    }
    if (!body.celular || String(body.celular).trim() === '') {
      throw new ValidationError('celular es requerido');
    }

    const ci = String(body.ci).trim();
    const expedicion = body.expedicion ?? null;

    // Unicidad de negocio: CI + expedición (solo contra participantes activos)
    const existente = await this.participanteRepository.findByCiExpedicion(ci, expedicion);
    if (existente) {
      throw new ConflictError(
        `Ya existe un participante con CI ${ci}${expedicion ? ` ${expedicion}` : ''} (ID ${existente.id})`
      );
    }

    const created = await this.participanteRepository.create(
      {
        ci,
        expedicion,
        nombres: String(body.nombres).trim(),
        apellidoPaterno: body.apellidoPaterno ?? null,
        apellidoMaterno: body.apellidoMaterno ?? null,
        celular: String(body.celular).trim(),
        email: body.email ?? null,
        ...(body.activo !== undefined ? { activo: body.activo } : {}),
      },
      userId
    );

    this.logger.info('[Capacitación] Participante creado', { id: created.id });
    return { participante: ParticipanteMapper.entityToPresentation(created) };
  }
}
