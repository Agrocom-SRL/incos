import { NotFoundError } from '../../../domain/errors/AppError.js';
import { SesionReforzamientoMapper } from '../../mappers/tutorias/index.js';

/**
 * Use Case: GetSesionReforzamientoByIdUseCase (A5)
 * Módulo: Tutorías (TUT · acompañamiento)
 *
 * Ficha de la sesión (vista 161) + participantes enriquecidos con datos del
 * estudiante y sus notas en la materia reforzada (join a la vista 156).
 */
export class GetSesionReforzamientoByIdUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.acompanamientoSesionViewRepository - Vistas 161/156
   * @param {ILogger} params.logger
   */
  constructor({ acompanamientoSesionViewRepository, logger }) {
    this.acompanamientoSesionViewRepository = acompanamientoSesionViewRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @returns {Promise<Object>} Ficha de la sesión con participantes
   */
  async execute(id) {
    const row = await this.acompanamientoSesionViewRepository.findSesionById(id);
    if (!row) {
      throw new NotFoundError(`sesión de reforzamiento con ID ${id}`);
    }

    const presentation = SesionReforzamientoMapper.viewRowToPresentation(row);
    const participanteRows =
      await this.acompanamientoSesionViewRepository.findParticipantesBySesionId(id);
    presentation.participantes =
      SesionReforzamientoMapper.participanteRowsToPresentation(participanteRows);

    this.logger.info('[Tutorías] Ficha de sesión de reforzamiento obtenida', {
      id,
      participantes: presentation.participantes.length,
    });

    return presentation;
  }
}
