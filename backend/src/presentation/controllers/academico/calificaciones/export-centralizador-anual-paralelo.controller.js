/**
 * GET /api/v1/calificaciones/centralizador/:paraleloGestionId/anual/export
 * Descarga Excel del Centralizador ANUAL de un paralelo (una sola hoja,
 * réplica del Libro de registro sobre los folios YA generados).
 */
export class ExportCentralizadorAnualParaleloController {
  constructor({ exportCentralizadorAnualParaleloExcelUseCase, logger }) {
    if (!exportCentralizadorAnualParaleloExcelUseCase) {
      throw new Error('exportCentralizadorAnualParaleloExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportCentralizadorAnualParaleloExcelUseCase =
      exportCentralizadorAnualParaleloExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const paraleloGestionId = req.params?.paraleloGestionId;

      this.logger.info('[Calificaciones] Export centralizador anual', { paraleloGestionId });

      const { buffer, fileName, mimeType } =
        await this.exportCentralizadorAnualParaleloExcelUseCase.execute({ paraleloGestionId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Calificaciones] Error export centralizador anual', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportCentralizadorAnualParaleloController;
