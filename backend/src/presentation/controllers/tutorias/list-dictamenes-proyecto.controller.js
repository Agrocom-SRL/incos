/**
 * GET /api/v1/proyectos-grado/:id/dictamenes (T22)
 * Dictámenes formales del proyecto. dataFieldName: 'dictamenes'.
 */
export class ListDictamenesProyectoController {
  constructor({ listDictamenesProyectoUseCase, logger, responseFormatter }) {
    this.listDictamenesProyectoUseCase = listDictamenesProyectoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      this.logger.info('[Tutorías] Request de dictámenes del proyecto', { proyectoGradoId });

      const data = await this.listDictamenesProyectoUseCase.execute(proyectoGradoId);

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Dictámenes del proyecto obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al listar dictámenes del proyecto', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
