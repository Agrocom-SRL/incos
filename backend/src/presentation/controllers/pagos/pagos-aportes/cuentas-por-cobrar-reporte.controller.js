/**
 * GET /api/v1/pagos-aportes/reportes/cuentas-por-cobrar
 * Planilla de control de Cuentas por cobrar (solo lectura).
 *
 * Query: gestion_id (opcional; gestión vigente por defecto).
 * Permiso: finanzas.pago.reporte.carrera LISTAR.
 *
 * Contrato: data.cuentasPorCobrar = planilla agrupada CARRERA → PARALELO → ESTUDIANTES.
 */
export class GetCuentasPorCobrarReporteController {
  /**
   * @param {Object} params
   * @param {import('../../../../application/use-cases/pagos/GetCuentasPorCobrarReporteUseCase.js').GetCuentasPorCobrarReporteUseCase} params.getCuentasPorCobrarReporteUseCase
   * @param {Object} params.logger
   * @param {import('../../../../infrastructure/services/ResponseFormatter.js').ResponseFormatter} params.responseFormatter
   */
  constructor({ getCuentasPorCobrarReporteUseCase, logger, responseFormatter }) {
    if (!getCuentasPorCobrarReporteUseCase) {
      throw new Error('getCuentasPorCobrarReporteUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    if (!responseFormatter) {
      throw new Error('responseFormatter es requerido');
    }
    this.getCuentasPorCobrarReporteUseCase = getCuentasPorCobrarReporteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'cuentasPorCobrar';
    this.resourceName = 'planilla de cuentas por cobrar';
  }

  async handle(req, res, next) {
    try {
      const gestionId =
        req.query?.gestion_id != null && req.query.gestion_id !== '' ? req.query.gestion_id : null;

      this.logger.info('[Pagos] Request planilla cuentas por cobrar', {
        gestion_id: gestionId,
        path: req.path,
      });

      const result = await this.getCuentasPorCobrarReporteUseCase.execute({ gestionId });

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
      this.logger.error('[Pagos] Error al generar planilla cuentas por cobrar', {
        error: error.message,
        stack: error.stack,
        query: req.query,
      });
      return next(error);
    }
  }
}
