/**
 * GET /api/v1/libros — listado de libros de registro (dataFieldName: `libros`).
 */
export class ListLibrosController {
  constructor({ listLibrosUseCase, logger, responseFormatter }) {
    this.listLibrosUseCase = listLibrosUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.listLibrosUseCase.execute({
        gestionId: req.query.gestionId,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Libros de registro obtenidos' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error GET listado', { error: error.message });
      return next(error);
    }
  }
}

export default ListLibrosController;
