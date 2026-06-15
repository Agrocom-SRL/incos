export class ListAsignaturasPlanByPlanController {
  constructor({ listAsignaturasPlanByPlanUseCase, logger, responseFormatter }) {
    this.listAsignaturasPlanByPlanUseCase = listAsignaturasPlanByPlanUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const planId = parseInt(req.params.id, 10);
      const result = await this.listAsignaturasPlanByPlanUseCase.execute(planId);
      return this.responseFormatter.retrieved(res, result, 'asignaturas', planId, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class ListAsignaturasPlanByPeriodoController {
  constructor({ listAsignaturasPlanByPeriodoUseCase, logger, responseFormatter }) {
    this.listAsignaturasPlanByPeriodoUseCase = listAsignaturasPlanByPeriodoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const periodoId = parseInt(req.params.id, 10);
      const result = await this.listAsignaturasPlanByPeriodoUseCase.execute(periodoId);
      return this.responseFormatter.retrieved(res, result, 'asignaturas', periodoId, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class CreateAsignaturaPlanController {
  constructor({ createAsignaturaPlanUseCase, logger, responseFormatter }) {
    this.createAsignaturaPlanUseCase = createAsignaturaPlanUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.createAsignaturaPlanUseCase.execute(body, userId);
      const asig = result.asignatura;
      return this.responseFormatter.created(res, asig, 'asignatura_plan', asig.id, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class UpdateAsignaturaPlanController {
  constructor({ updateAsignaturaPlanUseCase, logger, responseFormatter }) {
    this.updateAsignaturaPlanUseCase = updateAsignaturaPlanUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateAsignaturaPlanUseCase.execute(id, body, userId);
      const asig = result.asignatura;
      return this.responseFormatter.updated(res, asig, 'asignatura_plan', asig.id, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class DeleteAsignaturaPlanController {
  constructor({ deleteAsignaturaPlanUseCase, logger, responseFormatter }) {
    this.deleteAsignaturaPlanUseCase = deleteAsignaturaPlanUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      await this.deleteAsignaturaPlanUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'asignatura_plan', id, req);
    } catch (error) {
      return next(error);
    }
  }
}

