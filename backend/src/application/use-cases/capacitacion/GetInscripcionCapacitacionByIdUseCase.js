import {
  InscripcionCapacitacionMapper,
  PagoCapacitacionMapper,
} from '../../mappers/capacitacion/index.js';

/**
 * Use Case: GetInscripcionCapacitacionByIdUseCase
 * Módulo: Capacitación (CAP)
 *
 * Ficha de una inscripción: participante + curso + estado de pago derivado +
 * historial de pagos (con método de pago y datos mínimos de la cuenta).
 */
export class GetInscripcionCapacitacionByIdUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.pagoCapacitacionRepository
   * @param {Object} params.capacitacionCompromisoRepository
   * @param {ILogger} params.logger
   */
  constructor({
    inscripcionCapacitacionRepository,
    pagoCapacitacionRepository,
    capacitacionCompromisoRepository,
    logger,
  }) {
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.capacitacionCompromisoRepository = capacitacionCompromisoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} id - ID de la inscripción
   * @returns {Promise<Object|null>} Ficha en formato de presentación o null
   */
  async execute(id) {
    // UPDATE perezoso: marca INCUMPLIDO los compromisos VIGENTE ya vencidos
    // (puramente informativo, no toca capacitacion_inscritos).
    await this.capacitacionCompromisoRepository.marcarVencidosComoIncumplidos();

    const row = await this.inscripcionCapacitacionRepository.findListadoRowById(id);
    if (!row) return null;

    const presentation = InscripcionCapacitacionMapper.rowToPresentation(row);

    const pagoRows = await this.pagoCapacitacionRepository.findDetalleByInscripcionId(id);
    presentation.pagos = PagoCapacitacionMapper.rowsToPresentation(pagoRows);

    this.logger.info('[Capacitación] Ficha de inscripción obtenida', {
      id,
      pagos: presentation.pagos.length,
    });

    return presentation;
  }
}
