/**
 * GET /api/v1/proyectos-grado/:id/avances (T18)
 * Avances del proyecto. dataFieldName: 'avances'.
 */
export class ListAvancesProyectoController {
  constructor({ listAvancesProyectoUseCase, logger, responseFormatter }) {
    this.listAvancesProyectoUseCase = listAvancesProyectoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      this.logger.info('[Tutorías] Request de avances del proyecto', { proyectoGradoId });

      const data = await this.listAvancesProyectoUseCase.execute(proyectoGradoId);

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Avances del proyecto obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al listar avances del proyecto', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
