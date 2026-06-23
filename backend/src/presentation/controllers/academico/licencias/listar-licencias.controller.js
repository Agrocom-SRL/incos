/**
 * GET /api/v1/asistencia/licencias
 */
export class ListarLicenciasController {
  constructor({ listarLicenciasUseCase, logger, responseFormatter }) {
    this.listarLicenciasUseCase = listarLicenciasUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.listarLicenciasUseCase.execute({
        estado: req.query.estado,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Licencias obtenidas' },
        req,
      );
    } catch (error) {
      this.logger.error('[Licencias] Error GET listado', { error: error.message });
      return next(error);
    }
  }
}

export default ListarLicenciasController;
