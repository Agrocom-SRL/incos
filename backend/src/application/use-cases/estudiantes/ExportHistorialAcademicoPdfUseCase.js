/**
 * Exporta el Historial académico (kardex / transcript FORM-SIE-ITT-04) de un
 * estudiante a PDF (documento oficial sobre la plantilla institucional).
 *
 * REUTILIZA GetHistorialAcademicoUseCase para obtener exactamente el mismo
 * payload { estudiante, filas, resumen } que sirve la API (paridad pantalla ↔
 * PDF ↔ Excel) y delega el render en el generador inyectado
 * (IHistorialAcademicoPdfGenerator, pdf-lib sobre Plantilla.pdf).
 */

import { sanitizarFilePart } from '../../utils/centralizadorExcelDatos.js';

export class ExportHistorialAcademicoPdfUseCase {
  /**
   * @param {Object} params
   * @param {import('./GetHistorialAcademicoUseCase.js').GetHistorialAcademicoUseCase} params.getHistorialAcademicoUseCase
   * @param {import('../../../domain/interfaces/services/IHistorialAcademicoPdfGenerator.js').IHistorialAcademicoPdfGenerator} params.historialAcademicoPdfGenerator
   * @param {Object} params.logger
   */
  constructor({ getHistorialAcademicoUseCase, historialAcademicoPdfGenerator, logger }) {
    if (!getHistorialAcademicoUseCase) {
      throw new Error('getHistorialAcademicoUseCase es requerido');
    }
    if (!historialAcademicoPdfGenerator) {
      throw new Error('historialAcademicoPdfGenerator es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.getHistorialAcademicoUseCase = getHistorialAcademicoUseCase;
    this.historialAcademicoPdfGenerator = historialAcademicoPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number|string} params.estudianteId
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ estudianteId }) {
    const payload = await this.getHistorialAcademicoUseCase.execute({ estudianteId });

    const buffer =
      await this.historialAcademicoPdfGenerator.generarHistorialAcademico(payload);

    const matricula = sanitizarFilePart(payload.estudiante?.matricula) || `est_${estudianteId}`;
    const fileName = `Historial_Academico_${matricula}.pdf`;

    this.logger.info('[Estudiantes] Historial académico exportado a PDF', {
      estudianteId,
      filas: payload.filas?.length ?? 0,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/pdf',
    };
  }
}

export default ExportHistorialAcademicoPdfUseCase;
