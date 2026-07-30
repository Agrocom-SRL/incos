/**
 * GET /api/v1/libros/:id — ficha del libro con folios (dataFieldName: `libro`).
 */
export class GetLibroByIdController {
  constructor({ getLibroByIdUseCase, logger, responseFormatter }) {
    this.getLibroByIdUseCase = getLibroByIdUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.getLibroByIdUseCase.execute({
        id: Number(req.params.id),
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Libro de registro obtenido' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error GET detalle', { error: error.message });
      return next(error);
    }
  }
}

export default GetLibroByIdController;
