export class SetEstadoTipoParentescoController {
  constructor({ setEstadoTipoParentescoUseCase, logger, responseFormatter }) {
    this.setEstadoTipoParentescoUseCase = setEstadoTipoParentescoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoTipoParentescoUseCase.execute(id, activo, userId);
      const { tipoParentesco } = result;
      return this.responseFormatter.updated(
        res,
        tipoParentesco,
        'tipo de parentesco',
        tipoParentesco.id,
        req
      );
    } catch (error) {
      return next(error);
    }
  }
}
