/**
 * GET /api/v1/estudiantes/:id/historial-academico/export-pdf
 * Descarga el Historial académico (kardex / transcript FORM-SIE-ITT-04) de un
 * estudiante en PDF (documento oficial sobre la plantilla institucional).
 */
export class ExportHistorialAcademicoPdfController {
  /**
   * @param {Object} params
   * @param {Object} params.exportHistorialAcademicoPdfUseCase
   * @param {Object} params.logger
   */
  constructor({ exportHistorialAcademicoPdfUseCase, logger }) {
    if (!exportHistorialAcademicoPdfUseCase) {
      throw new Error('exportHistorialAcademicoPdfUseCase es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.exportHistorialAcademicoPdfUseCase = exportHistorialAcademicoPdfUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const estudianteId = req.params.id;

      this.logger.info('[Estudiantes] Export historial académico PDF', { estudianteId });

      const { buffer, fileName, mimeType } =
        await this.exportHistorialAcademicoPdfUseCase.execute({ estudianteId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Estudiantes] Error export historial académico PDF', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportHistorialAcademicoPdfController;
