/**
 * GET /api/v1/docentes/colores-en-uso
 */

export class GetDocenteColoresEnUsoController {
  constructor({ getDocenteColoresEnUsoUseCase, logger, responseFormatter }) {
    this.useCase = getDocenteColoresEnUsoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const payload = await this.useCase.execute();
      return this.responseFormatter._success(res, payload, {}, req);
    } catch (error) {
      this.logger.error('Error al listar colores en uso', { error: error.message });
      return next(error);
    }
  }
}
