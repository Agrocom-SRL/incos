export class SetEstadoDocumentacionController {
  constructor({ setEstadoDocumentacionUseCase, logger, responseFormatter }) {
    this.setEstadoDocumentacionUseCase = setEstadoDocumentacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoDocumentacionUseCase.execute(id, activo, userId);
      const { documentacion } = result;
      return this.responseFormatter.updated(
        res,
        documentacion,
        'documentacion',
        documentacion.id,
        req
      );
    } catch (error) {
      return next(error);
    }
  }
}
