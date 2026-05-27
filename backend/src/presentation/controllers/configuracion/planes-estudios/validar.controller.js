export class ValidarPlanEstudiosController {
  constructor({ validarPlanEstudiosUseCase, logger, responseFormatter }) {
    this.validarPlanEstudiosUseCase = validarPlanEstudiosUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.validarPlanEstudiosUseCase.execute(id);
      return this.responseFormatter.retrieved(res, result, 'validación de plan de estudios', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
