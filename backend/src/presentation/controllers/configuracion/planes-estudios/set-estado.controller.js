export class SetEstadoPlanEstudiosController {
  constructor({ setEstadoPlanEstudiosUseCase, logger, responseFormatter }) {
    this.setEstadoPlanEstudiosUseCase = setEstadoPlanEstudiosUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoPlanEstudiosUseCase.execute(id, activo, userId);
      const plan = result.plan_estudio;
      return this.responseFormatter.updated(res, plan, 'plan de estudios', plan.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
