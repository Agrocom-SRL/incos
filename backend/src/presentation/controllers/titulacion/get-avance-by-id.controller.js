/**
 * GET /api/v1/proyectos-grado/:id/avances/:avanceId (T19)
 * Detalle de un avance + bitácora vinculada. dataFieldName: 'avance'.
 */
export class GetAvanceByIdController {
  constructor({ getAvanceByIdUseCase, logger, responseFormatter }) {
    this.getAvanceByIdUseCase = getAvanceByIdUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const avanceId = parseInt(req.params.avanceId, 10);
      this.logger.info('[Tutorías] Request de detalle de avance', { proyectoGradoId, avanceId });

      const result = await this.getAvanceByIdUseCase.execute(proyectoGradoId, avanceId);

      return this.responseFormatter.retrieved(res, result, 'avance del proyecto', avanceId, req);
    } catch (error) {
      this.logger.error('[Tutorías] Error al obtener detalle de avance', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
