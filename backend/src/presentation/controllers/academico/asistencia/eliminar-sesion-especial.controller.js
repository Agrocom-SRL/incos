/**
 * DELETE /api/v1/asistencia/cursos/:asignacionId/sesiones-especiales/:fecha
 */
export class EliminarSesionEspecialController {
  constructor({ eliminarSesionEspecialUseCase, logger, responseFormatter }) {
    this.eliminarSesionEspecialUseCase = eliminarSesionEspecialUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.eliminarSesionEspecialUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        fecha: req.params.fecha,
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Sesión especial eliminada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Asistencia] Error DELETE sesión especial', { error: error.message });
      return next(error);
    }
  }
}
