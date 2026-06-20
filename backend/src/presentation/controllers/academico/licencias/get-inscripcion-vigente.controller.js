/**
 * GET /api/v1/asistencia/licencias/inscripcion-vigente?estudianteId=
 * Apoyo al formulario de solicitud: inscripción vigente del estudiante elegido.
 */
export class GetInscripcionVigenteController {
  constructor({ getInscripcionVigenteUseCase, logger, responseFormatter }) {
    this.getInscripcionVigenteUseCase = getInscripcionVigenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.getInscripcionVigenteUseCase.execute({
        estudianteId: Number(req.query.estudianteId),
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Inscripción vigente obtenida' },
        req,
      );
    } catch (error) {
      this.logger.error('[Licencias] Error GET inscripción vigente', { error: error.message });
      return next(error);
    }
  }
}

export default GetInscripcionVigenteController;
