/**
 * GET /api/v1/docentes/colores-sugeridos
 */

export class GetDocenteColoresSugeridosController {
  constructor({ getDocenteColoresSugeridosUseCase, logger, responseFormatter }) {
    this.useCase = getDocenteColoresSugeridosUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.useCase.execute();
      return this.responseFormatter._success(res, payload, {}, req);
    } catch (error) {
      this.logger.error('Error al listar colores sugeridos', { error: error.message });
      return next(error);
    }
  }
}
