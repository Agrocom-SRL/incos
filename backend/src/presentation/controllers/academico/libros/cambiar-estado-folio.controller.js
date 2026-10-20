/**
 * PATCH /api/v1/libros/:id/folios/:folioId/estado — transición de estado del
 * folio (BORRADOR → ANULADO) (dataFieldName: `folio`).
 */
export class CambiarEstadoFolioController {
  constructor({ cambiarEstadoFolioUseCase, logger, responseFormatter }) {
    this.cambiarEstadoFolioUseCase = cambiarEstadoFolioUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.cambiarEstadoFolioUseCase.execute({
        usuarioId: req.usuario?.id ?? null,
        id: Number(req.params.id),
        folioId: Number(req.params.folioId),
        body: req.body,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Estado del folio actualizado' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error PATCH estado folio', { error: error.message });
      return next(error);
    }
  }
}

export default CambiarEstadoFolioController;
