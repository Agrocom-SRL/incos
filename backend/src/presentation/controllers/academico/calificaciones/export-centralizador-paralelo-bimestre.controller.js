/**
 * GET /api/v1/calificaciones/centralizador/:paraleloGestionId/bimestre/:bimestre/export
 * Descarga Excel del Centralizador de Calificaciones (un paralelo, un bimestre).
 */
export class ExportCentralizadorParaleloBimestreController {
  constructor({ exportCentralizadorParaleloBimestreExcelUseCase, logger }) {
    if (!exportCentralizadorParaleloBimestreExcelUseCase) {
      throw new Error('exportCentralizadorParaleloBimestreExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportCentralizadorParaleloBimestreExcelUseCase =
      exportCentralizadorParaleloBimestreExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const paraleloGestionId = req.params?.paraleloGestionId ?? req.query?.paraleloGestionId;
      const bimestre = req.params?.bimestre ?? req.query?.bimestre;

      this.logger.info('[Calificaciones] Export centralizador', {
        paraleloGestionId,
        bimestre
      });

      const { buffer, fileName, mimeType } =
        await this.exportCentralizadorParaleloBimestreExcelUseCase.execute({
          paraleloGestionId,
          bimestre
        });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Calificaciones] Error export centralizador', {
        error: error.message,
        stack: error.stack
      });
      return next(error);
    }
  }
}

export default ExportCentralizadorParaleloBimestreController;
