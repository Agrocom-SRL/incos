/**
 * PATCH /api/v1/libros/:id — edita/cierra el libro (dataFieldName: `libro`).
 */
export class EditarLibroController {
  constructor({ editarLibroUseCase, logger, responseFormatter }) {
    this.editarLibroUseCase = editarLibroUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.editarLibroUseCase.execute({
        usuarioId: req.user?.id ?? null,
        id: Number(req.params.id),
        body: req.body,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Libro de registro actualizado' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error PATCH libro', { error: error.message });
      return next(error);
    }
  }
}

export default EditarLibroController;
