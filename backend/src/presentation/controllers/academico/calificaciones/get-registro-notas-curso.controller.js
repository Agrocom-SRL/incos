/**
 * GET /api/v1/calificaciones/asignaciones/:asignacionId/notas
 */

export class GetRegistroNotasCursoController {
  constructor({ getRegistroNotasCursoUseCase, logger, responseFormatter }) {
    this.getRegistroNotasCursoUseCase = getRegistroNotasCursoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const asignacionId = Number(req.params?.asignacionId);

      this.logger.info('[Calificaciones] Registro notas curso', {
        usuarioId: req.usuario?.id,
        asignacionId,
      });

      const payload = await this.getRegistroNotasCursoUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId,
      });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Registro de notas obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error registro notas', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
