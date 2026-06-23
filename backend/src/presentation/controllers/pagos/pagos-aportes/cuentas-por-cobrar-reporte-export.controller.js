/**
 * GET /api/v1/pagos-aportes/reportes/cuentas-por-cobrar/export
 * Excel (.xlsx, una hoja) de la Planilla de Control de Cuentas por Cobrar.
 *
 * Query: gestion_id (opcional; gestión vigente por defecto).
 * Permiso: finanzas.cuenta-cobrar.reporte EXPORTAR.
 */
export class ExportCuentasPorCobrarReporteExcelController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/ExportCuentasPorCobrarReporteExcelUseCase.js').ExportCuentasPorCobrarReporteExcelUseCase} params.exportCuentasPorCobrarReporteExcelUseCase
   * @param {Object} params.logger
   */
  constructor({ exportCuentasPorCobrarReporteExcelUseCase, logger }) {
    if (!exportCuentasPorCobrarReporteExcelUseCase) {
      throw new Error('exportCuentasPorCobrarReporteExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportCuentasPorCobrarReporteExcelUseCase = exportCuentasPorCobrarReporteExcelUseCase;
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

      this.logger.info('[Pagos] Request exportación Excel planilla cuentas por cobrar', {
        gestion_id: gestionId,
        path: req.path,
      });

      const { buffer, fileName, mimeType } =
        await this.exportCuentasPorCobrarReporteExcelUseCase.execute({ gestionId });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('[Pagos] Error al exportar Excel planilla cuentas por cobrar', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default ExportCuentasPorCobrarReporteExcelController;
