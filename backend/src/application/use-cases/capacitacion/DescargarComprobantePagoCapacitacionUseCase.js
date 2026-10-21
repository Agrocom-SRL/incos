import fs from 'fs';
import { NotFoundError } from '../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';

/**
 * Use Case: DescargarComprobantePagoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Resuelve la ruta del comprobante de un pago para su descarga autenticada
 * (GET /inscripciones-capacitacion/:id/pagos/:pagoId/comprobante; res.download
 * en el controller, nunca URL estática /uploads).
 */
export class DescargarComprobantePagoCapacitacionUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.pagoCapacitacionRepository
   * @param {ILogger} params.logger
   * @param {Object} [params.fileSystem] - Módulo fs (inyectable para pruebas)
   */
  constructor({ pagoCapacitacionRepository, logger, fileSystem = fs }) {
    this.pagoCapacitacionRepository = pagoCapacitacionRepository;
    this.logger = logger;
    this.fileSystem = fileSystem;
  }

  /**
   * @param {{inscripcionId: number, pagoId: number}} input
   * @returns {Promise<{absolutePath: string, fileName: string}>}
   */
  async execute({ inscripcionId, pagoId } = {}) {
    const idInscripcion = parseIdPositivo(inscripcionId, 'id de la inscripción');
    const idPago = parseIdPositivo(pagoId, 'id del pago');

    const pago = await this.pagoCapacitacionRepository.findById(idPago);
    if (!pago || Number(pago.capacitacionInscritoId) !== idInscripcion) {
      throw new NotFoundError(`pago con ID ${idPago} de la inscripción ${idInscripcion}`);
    }
    if (!pago.comprobanteRuta || !this.fileSystem.existsSync(pago.comprobanteRuta)) {
      throw new NotFoundError(`comprobante del pago ${idPago}`);
    }

    this.logger.info('[Capacitación] Descarga de comprobante autorizada', {
      pagoId: idPago,
      inscripcionId: idInscripcion,
    });
    return {
      absolutePath: pago.comprobanteRuta,
      fileName: pago.comprobanteNombre ?? `comprobante_${pago.numeroRecibo}`,
    };
  }
}
