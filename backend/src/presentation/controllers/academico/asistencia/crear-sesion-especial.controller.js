/**
 * POST /api/v1/asistencia/cursos/:asignacionId/sesiones-especiales
 */
export class CrearSesionEspecialController {
  constructor({ crearSesionEspecialUseCase, logger, responseFormatter }) {
    this.crearSesionEspecialUseCase = crearSesionEspecialUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.crearSesionEspecialUseCase.execute({
        usuarioId: req.usuario.id,
        asignacionId: req.params.asignacionId,
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Sesión especial creada', statusCode: 201 },
        req,
      );
    } catch (error) {
      this.logger.error('[Asistencia] Error POST sesión especial', { error: error.message });
      return next(error);
    }
  }
}
