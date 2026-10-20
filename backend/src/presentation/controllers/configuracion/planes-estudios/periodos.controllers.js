export class ListPeriodosByPlanController {
  constructor({ listPeriodosByPlanUseCase, logger, responseFormatter }) {
    this.listPeriodosByPlanUseCase = listPeriodosByPlanUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const planId = parseInt(req.params.id, 10);
      const result = await this.listPeriodosByPlanUseCase.execute(planId);
      return this.responseFormatter.retrieved(res, result, 'periodos', planId, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class CreatePeriodoController {
  constructor({ createPeriodoUseCase, logger, responseFormatter }) {
    this.createPeriodoUseCase = createPeriodoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const planId = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.createPeriodoUseCase.execute(planId, body, userId);
      const periodo = result.periodo;
      return this.responseFormatter.created(res, periodo, 'periodo', periodo.id, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class UpdatePeriodoController {
  constructor({ updatePeriodoUseCase, logger, responseFormatter }) {
    this.updatePeriodoUseCase = updatePeriodoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updatePeriodoUseCase.execute(id, body, userId);
      const periodo = result.periodo;
      return this.responseFormatter.updated(res, periodo, 'periodo', periodo.id, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class DeletePeriodoController {
  constructor({ deletePeriodoUseCase, logger, responseFormatter }) {
    this.deletePeriodoUseCase = deletePeriodoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      await this.deletePeriodoUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'periodo', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
