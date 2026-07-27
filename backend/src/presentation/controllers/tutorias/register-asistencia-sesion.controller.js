/**
 * PUT /api/v1/acompanamiento/sesiones/:id/participantes (A9)
 * Registro batch de estudiantes/asistencia/progreso de la sesión.
 * dataFieldName: 'estudiantes'.
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
      this.logger.info('[Tutorías] Request de registro batch de estudiantes', {
        sesionId,
        estudiantes: Array.isArray(req.body?.estudiantes) ? req.body.estudiantes.length : 0,
      });

      const result = await this.registerAsistenciaSesionUseCase.execute(
        sesionId,
        req.body || {},
        userId
      );

      return this.responseFormatter.updated(
        res,
        result,
        'estudiantes de la sesión',
        sesionId,
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al registrar estudiantes de la sesión', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
