export class GetPlanEstudiosMatrizController {
  constructor({ getPlanEstudiosMatrizUseCase, logger, responseFormatter }) {
    this.getPlanEstudiosMatrizUseCase = getPlanEstudiosMatrizUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.getPlanEstudiosMatrizUseCase.execute(id);
      return this.responseFormatter.retrieved(res, result, 'matriz de plan de estudios', id, req);
    } catch (error) {
      return next(error);
    }
  }
}

