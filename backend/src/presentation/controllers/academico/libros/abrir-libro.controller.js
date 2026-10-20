/**
 * POST /api/v1/libros — abre un libro de registro (dataFieldName: `libro`).
 */
export class AbrirLibroController {
  constructor({ abrirLibroUseCase, logger, responseFormatter }) {
    this.abrirLibroUseCase = abrirLibroUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.abrirLibroUseCase.execute({
        usuarioId: req.usuario?.id ?? null,
        body: req.body,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 201, message: 'Libro de registro abierto' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error POST abrir libro', { error: error.message });
      return next(error);
    }
  }
}

export default AbrirLibroController;
