/**
 * POST /api/v1/libros/:id/folios — genera los folios de un paralelo
 * (dataFieldName: `folios`).
 */
export class GenerarFoliosParaleloController {
  constructor({ generarFoliosParaleloUseCase, logger, responseFormatter }) {
    this.generarFoliosParaleloUseCase = generarFoliosParaleloUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.generarFoliosParaleloUseCase.execute({
        usuarioId: req.usuario?.id ?? null,
        id: Number(req.params.id),
        body: req.body,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 201, message: 'Folios del paralelo generados' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error POST generar folios', { error: error.message });
      return next(error);
    }
  }
}

export default GenerarFoliosParaleloController;
