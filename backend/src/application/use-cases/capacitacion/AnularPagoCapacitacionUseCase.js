import { ValidationError } from '../../../domain/errors/AppError.js';
import { sequelize } from '../../../infrastructure/database/sequelize.js';
import { PagoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import { recalcularEstadoInscripcion } from './helpers/estadoInscripcion.js';
import { cargarPagoModificable, resumenInscripcion } from './helpers/pagoInscripcionCapacitacion.js';

const MOTIVO_MINIMO = 3;
const MOTIVO_MAXIMO = 500;

/**
 * Use Case: AnularPagoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Anula un pago equivocado (POST /inscripciones-capacitacion/:id/pagos/:pagoId/anular,
 * permiso capacitacion.inscripcion EDITAR). El `motivo` es obligatorio. El pago se
 * CONSERVA como historial (`anulado = 1`, motivo, fecha y usuario) pero deja de contar
 * en totales, saldos, estados e ingresos (las sumas y la vista de ingresos excluyen
 * los anulados). No se emite recibo de un pago anulado. Es definitivo: para rehacerlo
 * se registra un pago nuevo. Solo con la inscripción PENDIENTE o INSCRITO. Tras
 * anular se recalculan los estados por concepto y el global (puede volver a PENDIENTE).
 */
export class AnularPagoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.pagoCapacitacionRepository
   * @param {Object} params.inscripcionCapacitacionRepository
   * @param {Object} params.capacitacionCompromisoRepository
   * @param {Object} params.capacitacionInscritoRequisitoRepository
   * @param {ILogger} params.logger
   */
  constructor({
    pagoCapacitacionRepository,
    inscripcionCapacitacionRepository,
    capacitacionCompromisoRepository,
    capacitacionInscritoRequisitoRepository,
    logger,
  }) {
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.inscripcionCapacitacionRepository = inscripcionCapacitacionRepository;
    this.capacitacionCompromisoRepository = capacitacionCompromisoRepository;
    this.capacitacionInscritoRequisitoRepository = capacitacionInscritoRequisitoRepository;
    this.logger = logger;
  }

  /**
   * @param {number} inscripcionId - ID de la inscripción
   * @param {number} pagoId - ID del pago
   * @param {Object} body - { motivo }
   * @param {number|null} userId - Usuario que anula (auditoría)
   * @returns {Promise<{pagoCapacitacion: Object}>}
   */
  async execute(inscripcionId, pagoId, body = {}, userId = null) {
    const idInscripcion = parseIdPositivo(inscripcionId, 'id de la inscripción');
    const idPago = parseIdPositivo(pagoId, 'id del pago');
    const motivo = this._parseMotivo(body.motivo);

    return sequelize.transaction((transaction) =>
      this._anular(idInscripcion, idPago, motivo, userId, transaction)
    );
  }

  /** @private */
  async _anular(idInscripcion, idPago, motivo, userId, transaction) {
    const { inscripcion } = await cargarPagoModificable({
      inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
      pagoCapacitacionRepository: this.pagoCapacitacionRepository,
      inscripcionId: idInscripcion,
      pagoId: idPago,
      accion: 'anular',
      transaction,
    });

    const actualizado = await this.pagoCapacitacionRepository.update(
      idPago,
      { anulado: true, motivoAnulacion: motivo, fechaAnulacion: new Date(), anuladoPor: userId },
      userId,
      { transaction }
    );
    this.logger.info('[Capacitación] Pago de capacitación anulado', {
      id: idPago,
      capacitacionInscritoId: idInscripcion,
      motivo,
    });

    const resumen = await recalcularEstadoInscripcion({
      inscripcion,
      pagoCapacitacionRepository: this.pagoCapacitacionRepository,
      capacitacionInscritoRequisitoRepository: this.capacitacionInscritoRequisitoRepository,
      inscripcionCapacitacionRepository: this.inscripcionCapacitacionRepository,
      capacitacionCompromisoRepository: this.capacitacionCompromisoRepository,
      userId,
      transaction,
    });

    const presentation = PagoCapacitacionMapper.entityToPresentation(actualizado);
    presentation.inscripcion = resumenInscripcion(idInscripcion, resumen);
    return { pagoCapacitacion: presentation };
  }

  /** Motivo obligatorio (3 a 500 caracteres). @private */
  _parseMotivo(valor) {
    const motivo = typeof valor === 'string' ? valor.trim() : '';
    if (motivo === '') throw new ValidationError('motivo es requerido para anular un pago');
    if (motivo.length < MOTIVO_MINIMO || motivo.length > MOTIVO_MAXIMO) {
      throw new ValidationError(
        `motivo debe tener entre ${MOTIVO_MINIMO} y ${MOTIVO_MAXIMO} caracteres`
      );
    }
    return motivo;
  }
}

export default AnularPagoCapacitacionUseCase;
