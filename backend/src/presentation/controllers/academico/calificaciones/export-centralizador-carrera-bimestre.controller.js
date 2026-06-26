/**
 * GET /api/v1/calificaciones/centralizador/carrera-de/:paraleloGestionId/bimestre/:bimestre/export
 * Descarga Excel MULTI-HOJA del Centralizador por carrera (una hoja por paralelo),
 * para el bimestre indicado. La carrera se deriva del paralelo de origen.
 */
export class ExportCentralizadorCarreraBimestreController {
  constructor({ exportCentralizadorCarreraBimestreExcelUseCase, logger }) {
    if (!exportCentralizadorCarreraBimestreExcelUseCase) {
      throw new Error('exportCentralizadorCarreraBimestreExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportCentralizadorCarreraBimestreExcelUseCase =
      exportCentralizadorCarreraBimestreExcelUseCase;
    this.logger = logger;
  }

  async handle(req, res, next) {
    try {
      const paraleloGestionId = req.params?.paraleloGestionId ?? req.query?.paraleloGestionId;
      const bimestre = req.params?.bimestre ?? req.query?.bimestre;

      this.logger.info('[Calificaciones] Export centralizador por carrera', {
        paraleloGestionId,
        bimestre
      });

      const { buffer, fileName, mimeType } =
        await this.exportCentralizadorCarreraBimestreExcelUseCase.execute({
          paraleloGestionId,
          bimestre
        });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Calificaciones] Error export centralizador por carrera', {
        error: error.message,
        stack: error.stack
      });
      return next(error);
    }
  }
}

export default ExportCentralizadorCarreraBimestreController;
