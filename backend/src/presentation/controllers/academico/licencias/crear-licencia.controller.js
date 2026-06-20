/**
 * POST /api/v1/asistencia/licencias
 */
export class CrearLicenciaController {
  constructor({ crearLicenciaUseCase, logger, responseFormatter }) {
    this.crearLicenciaUseCase = crearLicenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.crearLicenciaUseCase.execute({
        usuarioId: req.usuario.id,
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Solicitud de licencia registrada', statusCode: 201 },
        req,
      );
    } catch (error) {
      this.logger.error('[Licencias] Error POST solicitud', { error: error.message });
      return next(error);
    }
  }
}

export default CrearLicenciaController;
