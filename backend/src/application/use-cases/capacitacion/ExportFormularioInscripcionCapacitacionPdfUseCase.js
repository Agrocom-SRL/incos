import { NotFoundError } from '../../../domain/errors/AppError.js';
import { parseIdPositivo } from '../../utils/validacionEntrada.js';
import {
  construirDatosFormularioInscripcion,
  nombreArchivoFormulario,
} from './helpers/capacitacionPdfDatos.js';

/**
 * Use Case: ExportFormularioInscripcionCapacitacionPdfUseCase
 * Módulo: Capacitación (CAP)
 *
 * Exporta a PDF el Formulario de Inscripción de UNA inscripción (participante,
 * curso y grupo/horarios, requisitos, pagos y saldo, firmas).
 *
 * REUTILIZA `GetInscripcionCapacitacionByIdUseCase` para obtener la misma ficha que
 * pinta la pantalla (paridad pantalla ↔ PDF, sin consultas ni vistas nuevas). El
 * armado del payload se delega al helper `construirDatosFormularioInscripcion` y el
 * render al generador inyectado (IFormularioInscripcionCapacitacionPdfGenerator).
 */
export class ExportFormularioInscripcionCapacitacionPdfUseCase {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {Object} params.getInscripcionCapacitacionByIdUseCase
   * @param {import('../../../domain/interfaces/services/IFormularioInscripcionCapacitacionPdfGenerator.js').IFormularioInscripcionCapacitacionPdfGenerator} params.formularioInscripcionCapacitacionPdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    getInscripcionCapacitacionByIdUseCase,
    formularioInscripcionCapacitacionPdfGenerator,
    logger,
  }) {
    this.getInscripcionCapacitacionByIdUseCase = getInscripcionCapacitacionByIdUseCase;
    this.formularioInscripcionCapacitacionPdfGenerator =
      formularioInscripcionCapacitacionPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ inscripcionId: number|string }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ inscripcionId } = {}) {
    const id = parseIdPositivo(inscripcionId, 'id de la inscripción');

    const ficha = await this.getInscripcionCapacitacionByIdUseCase.execute(id);
    if (!ficha) throw new NotFoundError(`inscripción con ID ${id}`);

    const datos = construirDatosFormularioInscripcion(ficha);
    const buffer =
      await this.formularioInscripcionCapacitacionPdfGenerator.generarFormularioInscripcion(datos);
    const fileName = nombreArchivoFormulario(datos);

    this.logger.info('[Capacitación] Formulario de inscripción exportado a PDF', {
      inscripcionId: id,
      pagos: datos.pagos.length,
      requisitos: datos.requisitos.length,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/pdf',
    };
  }
}

export default ExportFormularioInscripcionCapacitacionPdfUseCase;
