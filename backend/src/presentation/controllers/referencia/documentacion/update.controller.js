export class UpdateDocumentacionController {
  constructor({ updateDocumentacionUseCase, logger, responseFormatter }) {
    this.updateDocumentacionUseCase = updateDocumentacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateDocumentacionUseCase.execute(id, body, userId);
      const documentacion = result.documentacion;
      return this.responseFormatter.updated(res, documentacion, 'tipo de documentación', documentacion.id, req);
    } catch (error) {
      return next(error);
    }
  }
}
