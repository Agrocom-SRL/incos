import fs from 'fs';
import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { PagoCapacitacionMapper } from '../../mappers/capacitacion/index.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';

/**
 * Use Case: AdjuntarComprobantePagoCapacitacionUseCase
 * Módulo: Capacitación (CAP)
 *
 * Adjunta (o reemplaza) el comprobante de depósito de un pago ya registrado
 * (POST /inscripciones-capacitacion/:id/pagos/:pagoId/comprobante). El archivo
 * llega subido por multer (`req.file`, imagen o PDF); el comprobante es siempre
 * opcional al registrar el pago y puede añadirse después, en cualquier estado
 * de la inscripción. Al reemplazar se borra el archivo anterior.
 */
export class AdjuntarComprobantePagoCapacitacionUseCase {
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
   * @param {Object} input
   * @param {number} input.inscripcionId
   * @param {number} input.pagoId
   * @param {Object} input.file - Archivo de multer (req.file)
   * @param {number|null} input.userId
   * @returns {Promise<{pagoCapacitacion: Object}>}
   */
  async execute({ inscripcionId, pagoId, file, userId = null } = {}) {
    try {
      if (!file) {
        throw new ValidationError('Debe adjuntar el comprobante (campo `comprobante`).');
      }
      const idInscripcion = parseIdPositivo(inscripcionId, 'id de la inscripción');
      const idPago = parseIdPositivo(pagoId, 'id del pago');

      const pago = await this.pagoCapacitacionRepository.findById(idPago);
      if (!pago || Number(pago.capacitacionInscritoId) !== idInscripcion) {
        throw new NotFoundError(`pago con ID ${idPago} de la inscripción ${idInscripcion}`);
      }

      const actualizado = await this.pagoCapacitacionRepository.update(
        idPago,
        { comprobanteRuta: file.path, comprobanteNombre: file.originalname },
        userId
      );
      this._borrarArchivo(pago.comprobanteRuta);

      this.logger.info('[Capacitación] Comprobante de pago adjuntado', {
        pagoId: idPago,
        inscripcionId: idInscripcion,
        reemplazo: Boolean(pago.comprobanteRuta),
      });
      return { pagoCapacitacion: PagoCapacitacionMapper.entityToPresentation(actualizado) };
    } catch (error) {
      this._borrarArchivo(file?.path);
      throw error;
    }
  }

  /** Borrado de mejor esfuerzo: un archivo huérfano no debe romper la operación. @private */
  _borrarArchivo(ruta) {
    if (!ruta) return;
    try {
      this.fileSystem.unlinkSync(ruta);
    } catch (error) {
      this.logger.warn?.('[Capacitación] No se pudo borrar el archivo de comprobante', {
        ruta,
        error: error.message,
      });
    }
  }
}
