/**
 * GET /api/v1/proyectos-grado/:id/acta-defensa
 * Actas de defensa del proyecto (N si PSP grupal), con tribunal anidado.
 * dataFieldName: 'actasDefensa'.
 */
export class ListActasDefensaController {
  constructor({ listActasDefensaProyectoUseCase, logger, responseFormatter }) {
    this.listActasDefensaProyectoUseCase = listActasDefensaProyectoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      this.logger.info('[Titulación] Request de actas de defensa del proyecto', {
        proyectoGradoId,
      });

      const data = await this.listActasDefensaProyectoUseCase.execute(proyectoGradoId);

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Actas de defensa del proyecto obtenidas correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Titulación] Error al listar actas de defensa del proyecto', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
