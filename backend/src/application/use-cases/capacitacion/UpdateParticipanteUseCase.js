import { ConflictError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ParticipanteMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: UpdateParticipanteUseCase
 * Módulo: Capacitación (CAP)
 *
 * Actualiza un participante. Si cambia CI/expedición, revalida la unicidad de
 * negocio CI + expedición excluyendo al propio participante.
 */
export class UpdateParticipanteUseCase {
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
   * @param {number} id - ID del participante
   * @param {Object} body - Campos a actualizar
   * @param {number|null} userId - Usuario que edita (auditoría)
   * @param {Object} [options] - `{ transaction }` cuando se compone dentro de otra
   *   transacción (p. ej. la edición de una inscripción)
   * @returns {Promise<{participante: Object}>}
   */
  async execute(id, body = {}, userId = null, options = {}) {
    const { transaction } = options;
    const repoOptions = transaction ? { transaction } : null;
    const existing = await this.participanteRepository.findById(id, {
      paranoid: false,
      ...(repoOptions ?? {}),
    });
    if (!existing) throw new NotFoundError('participante');

    const data = {};
    if ('ci' in body) {
      if (!body.ci || String(body.ci).trim() === '') {
        throw new ValidationError('ci no puede estar vacío');
      }
      data.ci = String(body.ci).trim();
    }
    if ('expedicion' in body) data.expedicion = body.expedicion ?? null;
    if ('nombres' in body) {
      if (!body.nombres || String(body.nombres).trim() === '') {
        throw new ValidationError('nombres no puede estar vacío');
      }
      data.nombres = String(body.nombres).trim();
    }
    if ('apellidoPaterno' in body) data.apellidoPaterno = body.apellidoPaterno ?? null;
    if ('apellidoMaterno' in body) data.apellidoMaterno = body.apellidoMaterno ?? null;
    if ('celular' in body) {
      if (!body.celular || String(body.celular).trim() === '') {
        throw new ValidationError('celular no puede estar vacío');
      }
      data.celular = String(body.celular).trim();
    }
    if ('email' in body) data.email = body.email ?? null;
    if ('activo' in body) data.activo = body.activo;

    // Revalidar unicidad CI + expedición con los valores finales
    if ('ci' in data || 'expedicion' in data) {
      const ciFinal = data.ci ?? existing.ci;
      const expedicionFinal = 'expedicion' in data ? data.expedicion : existing.expedicion;
      const duplicado = await this.participanteRepository.findByCiExpedicion(
        ciFinal,
        expedicionFinal,
        { excludeId: id }
      );
      if (duplicado) {
        throw new ConflictError(
          `Ya existe otro participante con CI ${ciFinal}${expedicionFinal ? ` ${expedicionFinal}` : ''} (ID ${duplicado.id})`
        );
      }
    }

    const updated = repoOptions
      ? await this.participanteRepository.update(id, data, userId, repoOptions)
      : await this.participanteRepository.update(id, data, userId);

    this.logger.info('[Capacitación] Participante actualizado', { id });
    return { participante: ParticipanteMapper.entityToPresentation(updated) };
  }
}
