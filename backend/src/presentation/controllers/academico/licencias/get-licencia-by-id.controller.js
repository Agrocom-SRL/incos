/**
 * GET /api/v1/asistencia/licencias/:id
 */
export class GetLicenciaByIdController {
  constructor({ getLicenciaByIdUseCase, logger, responseFormatter }) {
    this.getLicenciaByIdUseCase = getLicenciaByIdUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.getLicenciaByIdUseCase.execute({
        id: Number(req.params.id),
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Licencia obtenida' },
        req,
      );
    } catch (error) {
      this.logger.error('[Licencias] Error GET detalle', { error: error.message });
      return next(error);
    }
  }
}

export default GetLicenciaByIdController;
