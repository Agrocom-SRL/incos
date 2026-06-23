/**
 * POST /api/v1/configuracion-aportes
 * Crea una configuración de aporte académico.
 *
 * Permiso: configuracion.pagos (CREAR).
 * Body: monto_base (req), gestion_id?, aporte_activo?, fecha_inicio (req), fecha_fin?
 * Contrato: data.configuracionAporte = configuración creada.
 */
export class CreateConfiguracionAporteController {
  constructor({ createContributionConfigurationUseCase, logger, responseFormatter }) {
    this.createContributionConfigurationUseCase = createContributionConfigurationUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'configuracionAporte';
    this.resourceName = 'configuración de aporte';
  }

  async handle(req, res, next) {
    try {
      const userId = req.usuario?.id ?? null;
      const configuracion = await this.createContributionConfigurationUseCase.execute(req.body || {}, userId);

      return this.responseFormatter.created(
        res,
        { [this.dataFieldName]: configuracion },
        this.resourceName,
        configuracion?.id,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al crear configuración de aporte', {
        error: error.message,
        body: req.body,
      });
      return next(error);
    }
  }
}
