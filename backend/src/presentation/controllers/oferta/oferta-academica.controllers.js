/**
 * Controllers — INST Oferta Académica (Sprint 3)
 */

export class MarcarGestionVigenteController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, req.usuario?.id ?? null);
      return this.responseFormatter.updated(res, result.gestion, 'gestión', id, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class ListPlanesHabilitadosByGestionController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id);
      return this.responseFormatter._success(res, result, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class CreateGestionPlanController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const result = await this.useCase.execute(req.body, req.usuario?.id ?? null);
      const gp = result.gestionPlan;
      return this.responseFormatter.created(res, gp, 'gestion_plan', gp.id, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class UpdateGestionPlanEstadoController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, req.body, req.usuario?.id ?? null);
      return this.responseFormatter.updated(res, result.gestionPlan, 'gestion_plan', id, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class ListParalelosGestionByGestionPlanController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id);
      return this.responseFormatter._success(res, result, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class GenerarParalelosGestionController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, req.usuario?.id ?? null);
      return this.responseFormatter._success(res, result, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class GetParaleloGestionByIdController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id);
      return this.responseFormatter._success(res, result, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class UpdateParaleloGestionController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, req.body, req.usuario?.id ?? null);
      return this.responseFormatter.updated(res, result.paraleloGestion, 'paralelo_gestion', id, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class CambiarTurnoParaleloGestionController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, req.body, req.usuario?.id ?? null);
      return this.responseFormatter.updated(res, result.paraleloGestion, 'paralelo_gestion', id, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class UpdateParaleloGestionEstadoController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, req.body, req.usuario?.id ?? null);
      return this.responseFormatter.updated(res, result.paraleloGestion, 'paralelo_gestion', id, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class ValidarOfertaParaleloGestionController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id);
      return this.responseFormatter._success(res, { validacion: result }, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class ListOfertaCursosByParaleloGestionController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id);
      return this.responseFormatter._success(res, result, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class GenerarOfertaCursosController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, req.usuario?.id ?? null);
      return this.responseFormatter._success(res, result, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class CreateOfertaCursoController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const result = await this.useCase.execute(req.body, req.usuario?.id ?? null);
      const oc = result.ofertaCurso;
      return this.responseFormatter.created(res, oc, 'oferta_curso', oc.id, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class UpdateOfertaCursoEstadoController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await this.useCase.execute(id, req.body, req.usuario?.id ?? null);
      return this.responseFormatter.updated(res, result.ofertaCurso, 'oferta_curso', id, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class DeleteOfertaCursoController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }
  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await this.useCase.execute(id, req.usuario?.id ?? null);
      return this.responseFormatter.deleted(res, 'oferta_curso', id, req);
    } catch (e) {
      return next(e);
    }
  }
}
