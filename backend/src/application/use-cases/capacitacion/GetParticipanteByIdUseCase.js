import { ParticipanteMapper, InscripcionCapacitacionMapper } from '../../mappers/capacitacion/index.js';

/**
 * Use Case: GetParticipanteByIdUseCase
 * Módulo: Capacitación (CAP)
 *
 * Ficha de un participante: datos personales + sus inscripciones a
 * capacitaciones (con curso y estado de pago), para la vista de detalle.
 */
export class GetParticipanteByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.participanteRepository
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {ILogger} params.logger
   */
  constructor({ participanteRepository, inscripcionCapacitacionRepository, logger }) {
    this.participanteRepository = participanteRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID del participante
   * @returns {Promise<Object|null>} Ficha en formato de presentación o null
   */
  async execute(id) {
    const entity = await this.participanteRepository.findById(id, { paranoid: false });
    if (!entity) return null;

    const presentation = ParticipanteMapper.entityToPresentation(entity);

    // Inscripciones del participante (incluye retiradas/inactivas para historial)
    const { rows } = await this.inscripcionCapacitacionRepository.findListadoRows(
      { participanteId: id, includeInactive: true },
      1,
      500
    );
    presentation.inscripciones = InscripcionCapacitacionMapper.rowsToPresentation(rows);

    this.logger.info('[Capacitación] Ficha de participante obtenida', {
      id,
      inscripciones: presentation.inscripciones.length,
    });

    return presentation;
  }
}
