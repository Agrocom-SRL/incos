/**
 * Exporta el Historial académico (kardex / transcript FORM-SIE-ITT-04) de un
 * estudiante a Excel (libro de 1 hoja).
 *
 * REUTILIZA GetHistorialAcademicoUseCase para obtener exactamente el mismo
 * payload { estudiante, filas, resumen } que sirve la API (paridad pantalla ↔
 * Excel) y delega el render en el generador inyectado
 * (IHistorialAcademicoExcelGenerator, kit de planilla académica verde).
 */

import { sanitizarFilePart } from '../../utils/centralizadorExcelDatos.js';

export class ExportHistorialAcademicoExcelUseCase {
  /**
   * @param {Object} params
   * @param {import('./GetHistorialAcademicoUseCase.js').GetHistorialAcademicoUseCase} params.getHistorialAcademicoUseCase
   * @param {import('../../../domain/interfaces/services/IHistorialAcademicoExcelGenerator.js').IHistorialAcademicoExcelGenerator} params.historialAcademicoExcelGenerator
   * @param {Object} params.logger
   */
  constructor({ getHistorialAcademicoUseCase, historialAcademicoExcelGenerator, logger }) {
    if (!getHistorialAcademicoUseCase) {
      throw new Error('getHistorialAcademicoUseCase es requerido');
    }
    if (!historialAcademicoExcelGenerator) {
      throw new Error('historialAcademicoExcelGenerator es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.getHistorialAcademicoUseCase = getHistorialAcademicoUseCase;
    this.historialAcademicoExcelGenerator = historialAcademicoExcelGenerator;
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
      await this.historialAcademicoExcelGenerator.generarHistorialAcademico(payload);

    const matricula = sanitizarFilePart(payload.estudiante?.matricula) || `est_${estudianteId}`;
    const fileName = `Historial_Academico_${matricula}.xlsx`;

    this.logger.info('[Estudiantes] Historial académico exportado a Excel', {
      estudianteId,
      filas: payload.filas?.length ?? 0,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}

export default ExportHistorialAcademicoExcelUseCase;
