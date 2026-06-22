/**
 * GET /api/v1/pagos-aportes/reportes/becas-por-carrera/export
 * Excel (.xlsx, una hoja) de la Planilla de Control de Becas por carrera.
 *
 * Query: gestion_id (opcional; gestión vigente por defecto).
 * Permiso: finanzas.beca.reporte EXPORTAR.
 */
export class ExportBecasPorCarreraReporteExcelController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/ExportBecasPorCarreraReporteExcelUseCase.js').ExportBecasPorCarreraReporteExcelUseCase} params.exportBecasPorCarreraReporteExcelUseCase
   * @param {Object} params.logger
   */
  constructor({ exportBecasPorCarreraReporteExcelUseCase, logger }) {
    if (!exportBecasPorCarreraReporteExcelUseCase) {
      throw new Error('exportBecasPorCarreraReporteExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportBecasPorCarreraReporteExcelUseCase = exportBecasPorCarreraReporteExcelUseCase;
    this.logger = logger;
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async handle(req, res, next) {
    try {
      const gestionId =
        req.query?.gestion_id != null && req.query.gestion_id !== '' ? req.query.gestion_id : null;

      this.logger.info('[Pagos] Request exportación Excel planilla becas por carrera', {
        gestion_id: gestionId,
        path: req.path,
      });

      const { buffer, fileName, mimeType } =
        await this.exportBecasPorCarreraReporteExcelUseCase.execute({ gestionId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Pagos] Error al exportar Excel planilla becas por carrera', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportBecasPorCarreraReporteExcelController;
