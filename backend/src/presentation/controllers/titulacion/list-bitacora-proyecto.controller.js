/**
 * GET /api/v1/proyectos-grado/:id/bitacora (T14)
 * Bitácora de tutoría del proyecto. dataFieldName: 'bitacoraEntradas'.
 */
export class ListBitacoraProyectoController {
  constructor({ listBitacoraProyectoUseCase, logger, responseFormatter }) {
    this.listBitacoraProyectoUseCase = listBitacoraProyectoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      this.logger.info('[Tutorías] Request de bitácora del proyecto', { proyectoGradoId });

      const data = await this.listBitacoraProyectoUseCase.execute(proyectoGradoId);

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Bitácora del proyecto obtenida correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al listar bitácora del proyecto', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
