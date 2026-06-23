/**
 * GET /api/v1/pagos-aportes/reportes/becas-por-carrera
 * Planilla de control de Becas por carrera (solo lectura).
 *
 * Query: gestion_id (opcional; gestión vigente por defecto).
 * Permiso: finanzas.pago.reporte.carrera LISTAR.
 *
 * Contrato: data.{dataFieldName} = planillaBecas.
 */
export class GetBecasPorCarreraReporteController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/GetBecasPorCarreraReporteUseCase.js').GetBecasPorCarreraReporteUseCase} params.getBecasPorCarreraReporteUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getBecasPorCarreraReporteUseCase, logger, responseFormatter }) {
    if (!getBecasPorCarreraReporteUseCase) {
      throw new Error('getBecasPorCarreraReporteUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    if (!responseFormatter) {
      throw new Error('responseFormatter es requerido');
    }
    this.getBecasPorCarreraReporteUseCase = getBecasPorCarreraReporteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'planillaBecas';
    this.resourceName = 'planilla de becas por carrera';
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

      this.logger.info('[Pagos] Request planilla becas por carrera', {
        gestion_id: gestionId,
        path: req.path,
      });

      const result = await this.getBecasPorCarreraReporteUseCase.execute({ gestionId });

      const responseData = { [this.dataFieldName]: result };
      const gestionResId = result?.gestion?.id ?? gestionId ?? 'vigente';

      return this.responseFormatter.retrieved(
        res,
        responseData,
        this.resourceName,
        gestionResId,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al generar planilla becas por carrera', {
        error: error.message,
        stack: error.stack,
        query: req.query,
      });
      return next(error);
    }
  }
}
