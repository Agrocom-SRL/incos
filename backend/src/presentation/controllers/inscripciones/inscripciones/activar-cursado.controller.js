/**
 * PATCH /api/v1/inscripciones/:id/activar-cursado
 * Controller para activar el cursado de una inscripción (INSCRITO → CURSANDO + bimestres).
 *
 * Responsabilidades:
 * - Recibir la petición HTTP PATCH
 * - Delegar en CambiarEstadoMatriculaUseCase
 * - Formatear respuesta JSON estandarizada
 */
export class ActivarCursadoMatriculaController {
  constructor({ cambiarEstadoMatriculaUseCase, logger, responseFormatter }) {
    this.cambiarEstadoMatriculaUseCase = cambiarEstadoMatriculaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    const inscripcionId = Number(req.params.id);

    try {
      const payload = await this.cambiarEstadoMatriculaUseCase.execute({
        inscripcionId,
        userId: req.usuario?.id ?? null,
      });

      return this.responseFormatter.updated(
        res,
        { inscripcion: payload },
        'inscripción',
        inscripcionId,
        req,
      );
    } catch (error) {
      this.logger.error('[Inscripciones] Error al activar cursado', {
        inscripcionId,
        error: error.message,
      });
      return next(error);
    }
  }
}
