/**
 * DELETE /api/v1/proyectos-grado/:id (T9)
 * Elimina (soft) el proyecto de grado. dataFieldName: 'proyectoGrado'.
 */
export class DeleteProyectoGradoController {
  constructor({ deleteProyectoGradoUseCase, logger, responseFormatter }) {
    this.deleteProyectoGradoUseCase = deleteProyectoGradoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de eliminación de proyecto de grado', { id });

      await this.deleteProyectoGradoUseCase.execute(id, userId);

      return this.responseFormatter.deleted(res, 'proyecto de grado', id, req);
    } catch (error) {
      this.logger.error('[Tutorías] Error al eliminar proyecto de grado', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
