/**
 * PUT /api/v1/asistencia/cursos/:asignacionId/planilla
 */
export class BulkRegistrarAsistenciaController {
  constructor({ bulkRegistrarAsistenciaUseCase, logger, responseFormatter }) {
    this.bulkRegistrarAsistenciaUseCase = bulkRegistrarAsistenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.bulkRegistrarAsistenciaUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Asistencia registrada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Asistencia] Error PUT planilla', { error: error.message });
      return next(error);
    }
  }
}
