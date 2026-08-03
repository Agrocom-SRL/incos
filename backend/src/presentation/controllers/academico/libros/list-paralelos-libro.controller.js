/**
 * GET /api/v1/libros/:id/paralelos — paralelos candidatos del generador de
 * folios (dataFieldName: `paralelos`).
 */
export class ListParalelosLibroController {
  constructor({ listParalelosLibroUseCase, logger, responseFormatter }) {
    this.listParalelosLibroUseCase = listParalelosLibroUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.listParalelosLibroUseCase.execute({
        id: Number(req.params.id),
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Paralelos del libro obtenidos' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error GET paralelos', { error: error.message });
      return next(error);
    }
  }
}

export default ListParalelosLibroController;
