/**
 * GET /api/v1/avance-academico/export[?carreraId=<entero>]
 * Descarga Excel del Avance académico (1 hoja, planilla verde).
 * Permiso: academico.avance · EXPORTAR.
 */
export class ExportAvanceAcademicoController {
  constructor({ exportAvanceAcademicoExcelUseCase, logger }) {
    if (!exportAvanceAcademicoExcelUseCase) {
      throw new Error('exportAvanceAcademicoExcelUseCase es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.exportAvanceAcademicoExcelUseCase = exportAvanceAcademicoExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { carreraId } = req.query;

      this.logger.info('[Académico] Export avance académico', { carreraId });

      const { buffer, fileName, mimeType } =
        await this.exportAvanceAcademicoExcelUseCase.execute({ carreraId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Académico] Error export avance académico', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportAvanceAcademicoController;
