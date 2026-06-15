/**
 * Controllers — Sprint 5 horarios (bloques, conflictos, publicación).
 */

export class CreateAsignacionHorarioController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const data = await this.useCase.execute(req.body, req.user?.id);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class UpdateAsignacionHorarioController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.useCase.execute(id, req.body, req.user?.id);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class DeleteAsignacionHorarioController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.useCase.execute(id, req.user?.id);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class BulkAsignacionHorariosController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const data = await this.useCase.execute(req.body, req.user?.id);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class ValidarConflictoHorarioController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const data = await this.useCase.execute(req.body);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class GetParaleloGestionConflictosController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.useCase.execute(id);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class GetGestionConflictosController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.useCase.execute(id);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class PublicarParaleloGestionController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.useCase.execute(id, req.user?.id);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class PublicarTodosParalelosGestionController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.useCase.execute(id, req.user?.id);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}

export class CambiarTurnoParaleloGestionConBloquesController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await this.useCase.execute(id, req.body, req.user?.id);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}
