/**
 * PATCH /api/v1/libros/:id/folios/:folioId/estudiantes/:filaId — edita ESTADO/
 * OBSERVACIONES de una fila del folio (dataFieldName: `folioEstudiante`).
 */
export class EditarFolioEstudianteController {
  constructor({ editarFolioEstudianteUseCase, logger, responseFormatter }) {
    this.editarFolioEstudianteUseCase = editarFolioEstudianteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.editarFolioEstudianteUseCase.execute({
        usuarioId: req.user?.id ?? null,
        id: Number(req.params.id),
        folioId: Number(req.params.folioId),
        filaId: Number(req.params.filaId),
        body: req.body,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Fila del folio actualizada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Libros] Error PATCH fila de folio', { error: error.message });
      return next(error);
    }
  }
}

export default EditarFolioEstudianteController;
