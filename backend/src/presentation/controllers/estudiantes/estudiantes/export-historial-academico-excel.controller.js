/**
 * GET /api/v1/estudiantes/:id/historial-academico/export
 * Descarga el Historial académico (kardex / transcript FORM-SIE-ITT-04) de un
 * estudiante en Excel (kit de planilla académica, cabecera verde primario).
 */
export class ExportHistorialAcademicoExcelController {
  /**
   * @param {Object} params
   * @param {Object} params.exportHistorialAcademicoExcelUseCase
   * @param {Object} params.logger
   */
  constructor({ exportHistorialAcademicoExcelUseCase, logger }) {
    if (!exportHistorialAcademicoExcelUseCase) {
      throw new Error('exportHistorialAcademicoExcelUseCase es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.exportHistorialAcademicoExcelUseCase = exportHistorialAcademicoExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const estudianteId = req.params.id;

      this.logger.info('[Estudiantes] Export historial académico Excel', { estudianteId });

      const { buffer, fileName, mimeType } =
        await this.exportHistorialAcademicoExcelUseCase.execute({ estudianteId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Estudiantes] Error export historial académico Excel', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportHistorialAcademicoExcelController;
