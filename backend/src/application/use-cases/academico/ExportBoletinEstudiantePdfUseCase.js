/**
 * Exporta el Boletín de Calificaciones de UN estudiante a PDF (tamaño carta).
 *
 * Espejo del use case Excel del centralizador: REUTILIZA GetCentralizadorParaleloUseCase
 * para obtener la misma matriz que pinta la pantalla (paridad pantalla ↔ boletín) y la
 * cabecera del paralelo desde la vista 87 (carrera, periodo/curso, paralelo). El armado
 * del payload `datos` se delega al helper `construirDatosBoletinEstudiante` y el render
 * al generador inyectado (IBoletinPdfGenerator).
 */

import { NotFoundError } from '../../../domain/errors/AppError.js';
import { sanitizarFilePart } from '../../utils/centralizadorExcelDatos.js';
import { construirDatosBoletinEstudiante } from '../../utils/boletinPdfDatos.js';

export class ExportBoletinEstudiantePdfUseCase {
  constructor({
    getCentralizadorParaleloUseCase,
    parallelRepository,
    boletinPdfGenerator,
    logger
  }) {
    if (!getCentralizadorParaleloUseCase) {
      throw new Error('getCentralizadorParaleloUseCase es requerido');
    }
    if (!parallelRepository) throw new Error('parallelRepository es requerido');
    if (!boletinPdfGenerator) throw new Error('boletinPdfGenerator es requerido');
    if (!logger) throw new Error('logger es requerido');
    this.getCentralizadorParaleloUseCase = getCentralizadorParaleloUseCase;
    this.parallelRepository = parallelRepository;
    this.boletinPdfGenerator = boletinPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ paraleloGestionId: number|string, estudianteId: number|string }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ paraleloGestionId, estudianteId }) {
    const pgId = Number(paraleloGestionId);
    const estId = Number(estudianteId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      throw new NotFoundError('Paralelo');
    }
    if (!Number.isFinite(estId) || estId < 1) {
      throw new NotFoundError('Estudiante');
    }

    // Matriz (misma fuente que la pantalla) + cabecera del paralelo (vista 87).
    const [matriz, cabeceraRow] = await Promise.all([
      this.getCentralizadorParaleloUseCase.execute({ paraleloGestionId: pgId }),
      this.parallelRepository.obtenerCabeceraParaleloGestion(pgId)
    ]);

    const resultado = construirDatosBoletinEstudiante({
      matriz,
      cabeceraRow,
      estudianteId: estId
    });
    if (!resultado) {
      throw new NotFoundError('Estudiante');
    }

    const { datos, fileNameParts } = resultado;
    const buffer = await this.boletinPdfGenerator.generarBoletinEstudiante(datos);

    const fileName = `Boletin_${sanitizarFilePart(fileNameParts.estudiante)}_${sanitizarFilePart(
      fileNameParts.carrera
    )}_${sanitizarFilePart(fileNameParts.paralelo)}_${sanitizarFilePart(
      fileNameParts.gestion
    )}.pdf`;

    this.logger.info('[Calificaciones] Boletín de estudiante exportado a PDF', {
      paraleloGestionId: pgId,
      estudianteId: estId,
      asignaturas: datos.filas.length,
      fileName
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/pdf'
    };
  }
}

export default ExportBoletinEstudiantePdfUseCase;
