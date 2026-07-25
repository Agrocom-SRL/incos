/**
 * PUT /api/v1/acompanamiento/sesiones/:id/participantes (A9)
 * Registro batch de participantes/asistencia/progreso de la sesión.
 * dataFieldName: 'participantes'.
 */
export class RegisterAsistenciaSesionController {
  constructor({ registerAsistenciaSesionUseCase, logger, responseFormatter }) {
    this.registerAsistenciaSesionUseCase = registerAsistenciaSesionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const sesionId = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de registro batch de participantes', {
        sesionId,
        participantes: Array.isArray(req.body?.participantes)
          ? req.body.participantes.length
          : 0,
      });

      const result = await this.registerAsistenciaSesionUseCase.execute(
        sesionId,
        req.body || {},
        userId
      );

      return this.responseFormatter.updated(
        res,
        result,
        'participantes de la sesión',
        sesionId,
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al registrar participantes de la sesión', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
