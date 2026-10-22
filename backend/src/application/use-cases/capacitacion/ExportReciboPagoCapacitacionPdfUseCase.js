import { NotFoundError } from '../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import { construirDatosReciboPago, nombreArchivoRecibo } from './helpers/capacitacionPdfDatos.js';

/**
 * Use Case: ExportReciboPagoCapacitacionPdfUseCase
 * Módulo: Capacitación (CAP)
 *
 * Exporta a PDF el Recibo de Pago de UN pago de una inscripción. Valida que el pago
 * pertenezca a la inscripción (un pago ajeno o inexistente → NotFoundError) y
 * calcula el saldo pendiente en el momento de ese pago.
 *
 * REUTILIZA `GetInscripcionCapacitacionByIdUseCase`: su ficha ya trae el historial
 * de pagos con concepto, método y cuenta, por lo que no se duplican consultas. El
 * payload lo arma `construirDatosReciboPago` y el render el generador inyectado
 * (IReciboPagoCapacitacionPdfGenerator).
 */
export class ExportReciboPagoCapacitacionPdfUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.getInscripcionCapacitacionByIdUseCase
   * @param {import('../../../domain/interfaces/services/IReciboPagoCapacitacionPdfGenerator.js').IReciboPagoCapacitacionPdfGenerator} params.reciboPagoCapacitacionPdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    getInscripcionCapacitacionByIdUseCase,
    reciboPagoCapacitacionPdfGenerator,
    logger,
  }) {
    this.getInscripcionCapacitacionByIdUseCase = getInscripcionCapacitacionByIdUseCase;
    this.reciboPagoCapacitacionPdfGenerator = reciboPagoCapacitacionPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ inscripcionId: number|string, pagoId: number|string }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ inscripcionId, pagoId } = {}) {
    const idInscripcion = parseIdPositivo(inscripcionId, 'id de la inscripción');
    const idPago = parseIdPositivo(pagoId, 'id del pago');

    const ficha = await this.getInscripcionCapacitacionByIdUseCase.execute(idInscripcion);
    if (!ficha) throw new NotFoundError(`inscripción con ID ${idInscripcion}`);

    const datos = construirDatosReciboPago(ficha, idPago);
    if (!datos) {
      throw new NotFoundError(`pago con ID ${idPago} de la inscripción ${idInscripcion}`);
    }

    const buffer = await this.reciboPagoCapacitacionPdfGenerator.generarRecibo(datos);
    const fileName = nombreArchivoRecibo(datos);

    this.logger.info('[Capacitación] Recibo de pago exportado a PDF', {
      inscripcionId: idInscripcion,
      pagoId: idPago,
      concepto: datos.concepto,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/pdf',
    };
  }
}

export default ExportReciboPagoCapacitacionPdfUseCase;
