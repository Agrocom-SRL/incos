/**
 * GET /api/v1/pagos-aportes/mis-aportes/:cabeceraId
 * Detalle (cabecera + cuotas pagadas) de un aporte del estudiante de la sesión.
 *
 * El estudiante se resuelve en servidor y se verifica la pertenencia de la cabecera
 * (lo hace el use case). No expone recibo/comprobante.
 */
export class MisAporteDetailController {
  /**
   * @param {Object} params
   * @param {Object} params.getMiAporteDetalleEstudianteUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getMiAporteDetalleEstudianteUseCase, logger, responseFormatter }) {
    this.getMiAporteDetalleEstudianteUseCase = getMiAporteDetalleEstudianteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      const cabeceraId = parseInt(req.params?.cabeceraId, 10);

      this.logger.info('[Pagos] Mi aporte detalle solicitado', { usuarioId, cabeceraId });

      const payload = await this.getMiAporteDetalleEstudianteUseCase.execute({
        usuarioId,
        cabeceraId,
      });

      return this.responseFormatter.retrieved(res, payload, 'aporte', cabeceraId, req);
    } catch (error) {
      this.logger.error('[Pagos] Error al obtener mi aporte detalle', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default MisAporteDetailController;
