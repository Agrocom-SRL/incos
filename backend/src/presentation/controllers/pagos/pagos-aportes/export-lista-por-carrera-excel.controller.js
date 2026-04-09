/**
 * GET /api/v1/pagos-aportes/export/lista-por-carrera
 * Excel de estado de aporte por carrera (hojas por paralelo).
 *
 * Query: carrera_id (requerido), gestion_id (opcional; gestión vigente por defecto)
 */
export class ExportListaAportesPorCarreraExcelController {
  /**
   * @param {Object} params
   * @param {Object} params.exportPaymentAporteByCareerExcelUseCase
   * @param {Object} params.logger
   */
  constructor({ exportPaymentAporteByCareerExcelUseCase, logger }) {
    if (!exportPaymentAporteByCareerExcelUseCase) {
      throw new Error('exportPaymentAporteByCareerExcelUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    this.exportPaymentAporteByCareerExcelUseCase = exportPaymentAporteByCareerExcelUseCase;
    this.logger = logger;
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async handle(req, res, next) {
    try {
      const gestionId = req.query?.gestion_id;
      const carreraId = req.query?.carrera_id;

      this.logger.info('Request exportación Excel lista aportes por carrera', {
        gestion_id: gestionId,
        carrera_id: carreraId,
        path: req.path,
      });

      const execResult = await this.exportPaymentAporteByCareerExcelUseCase.execute({
        gestionId,
        carreraId,
      });
      const { buffer, fileName, mimeType } = execResult;

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    } catch (error) {
      this.logger.error('Error al exportar Excel lista aportes por carrera', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
