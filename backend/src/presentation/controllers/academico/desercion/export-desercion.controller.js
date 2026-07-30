/**
 * GET /api/v1/desercion/export[?gestionId=<entero>][&carreraId=<entero>]
 * Descarga Excel del reporte de Deserción estudiantil (1 hoja, planilla verde).
 * Permiso: academico.desercion · EXPORTAR.
 */
export class ExportDesercionController {
  constructor({ exportDesercionExcelUseCase, logger }) {
    if (!exportDesercionExcelUseCase) {
      throw new Error('exportDesercionExcelUseCase es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.exportDesercionExcelUseCase = exportDesercionExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const { gestionId, carreraId } = req.query;

      this.logger.info('[Académico] Export deserción', { gestionId, carreraId });

      const { buffer, fileName, mimeType } = await this.exportDesercionExcelUseCase.execute({
        gestionId,
        carreraId,
      });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Académico] Error export deserción', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportDesercionController;
