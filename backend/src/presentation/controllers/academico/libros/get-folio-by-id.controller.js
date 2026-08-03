/**
 * GET /api/v1/libros/:id/folios/:folioId — detalle del folio con nómina y
 * celdas de la vista 135 (dataFieldName: `folio`).
 */
export class GetFolioByIdController {
  constructor({ getFolioByIdUseCase, logger, responseFormatter }) {
    this.getFolioByIdUseCase = getFolioByIdUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.getFolioByIdUseCase.execute({
        id: Number(req.params.id),
        folioId: Number(req.params.folioId),
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Folio obtenido' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error GET folio', { error: error.message });
      return next(error);
    }
  }
}

export default GetFolioByIdController;
