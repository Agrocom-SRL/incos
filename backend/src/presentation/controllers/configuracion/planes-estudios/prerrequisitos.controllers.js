export class ListPrerrequisitosByAsignaturaController {
  constructor({ listPrerrequisitosByAsignaturaUseCase, logger, responseFormatter }) {
    this.listPrerrequisitosByAsignaturaUseCase = listPrerrequisitosByAsignaturaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const asignaturaId = parseInt(req.params.id, 10);
      const result = await this.listPrerrequisitosByAsignaturaUseCase.execute(asignaturaId);
      return this.responseFormatter.retrieved(res, result, 'prerrequisitos', asignaturaId, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class ListEsPrerrequisitoDeController {
  constructor({ listEsPrerrequisitoDeUseCase, logger, responseFormatter }) {
    this.listEsPrerrequisitoDeUseCase = listEsPrerrequisitoDeUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const asignaturaId = parseInt(req.params.id, 10);
      const result = await this.listEsPrerrequisitoDeUseCase.execute(asignaturaId);
      return this.responseFormatter.retrieved(res, result, 'prerrequisitos', asignaturaId, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class CreatePrerrequisitoController {
  constructor({ createPrerrequisitoUseCase, logger, responseFormatter }) {
    this.createPrerrequisitoUseCase = createPrerrequisitoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.createPrerrequisitoUseCase.execute(body, userId);
      const pre = result.prerrequisito;
      return this.responseFormatter.created(res, pre, 'prerrequisito', pre.id, req);
    } catch (error) {
      return next(error);
    }
  }
}

export class DeletePrerrequisitoController {
  constructor({ deletePrerrequisitoUseCase, logger, responseFormatter }) {
    this.deletePrerrequisitoUseCase = deletePrerrequisitoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      await this.deletePrerrequisitoUseCase.execute(id, userId);
      return this.responseFormatter.deleted(res, 'prerrequisito', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
