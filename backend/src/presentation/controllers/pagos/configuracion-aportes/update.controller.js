/**
 * PUT /api/v1/configuracion-aportes/:id
 * Edita una configuración de aporte académico.
 *
 * Permiso: finanzas.aporte (EDITAR).
 * Body: monto_base?, aporte_activo?, fecha_inicio?, fecha_fin?, activo?
 * Contrato: data.configuracionAporte = configuración actualizada.
 */
export class UpdateConfiguracionAporteController {
  constructor({ updateContributionConfigurationUseCase, logger, responseFormatter }) {
    this.updateContributionConfigurationUseCase = updateContributionConfigurationUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'configuracionAporte';
    this.resourceName = 'configuración de aporte';
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const configuracion = await this.updateContributionConfigurationUseCase.execute(
        id,
        req.body || {},
        userId
      );

      return this.responseFormatter.updated(
        res,
        { [this.dataFieldName]: configuracion },
        this.resourceName,
        id,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al actualizar configuración de aporte', {
        error: error.message,
        params: req.params,
        body: req.body,
      });
      return next(error);
    }
  }
}
