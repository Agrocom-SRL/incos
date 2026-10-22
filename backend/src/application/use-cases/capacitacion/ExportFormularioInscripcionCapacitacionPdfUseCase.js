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
 * curso y grupo, requisitos, grupos disponibles con su horario y firmas).
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
   * @param {Object} params.getCursoCapacitacionByIdUseCase - Grupos del curso con sus horarios
   * @param {import('../../../domain/interfaces/services/IFormularioInscripcionCapacitacionPdfGenerator.js').IFormularioInscripcionCapacitacionPdfGenerator} params.formularioInscripcionCapacitacionPdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    getInscripcionCapacitacionByIdUseCase,
    getCursoCapacitacionByIdUseCase,
    formularioInscripcionCapacitacionPdfGenerator,
    logger,
  }) {
    this.getInscripcionCapacitacionByIdUseCase = getInscripcionCapacitacionByIdUseCase;
    this.getCursoCapacitacionByIdUseCase = getCursoCapacitacionByIdUseCase;
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

    const curso = await this.getCursoCapacitacionByIdUseCase.execute(ficha.capacitacionId);
    const datos = construirDatosFormularioInscripcion(ficha, { gruposCurso: curso?.grupos ?? null });
    const buffer =
      await this.formularioInscripcionCapacitacionPdfGenerator.generarFormularioInscripcion(datos);
    const fileName = nombreArchivoFormulario(datos);

    this.logger.info('[Capacitación] Formulario de inscripción exportado a PDF', {
      inscripcionId: id,
      grupos: datos.grupos.length,
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
