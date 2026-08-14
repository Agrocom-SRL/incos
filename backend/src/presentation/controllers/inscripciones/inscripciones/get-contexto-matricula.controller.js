/**
 * GET /api/v1/inscripciones/contexto-matricula
 * Controller del contexto de matrícula para el wizard de inscripción.
 *
 * Query (validada por contextoMatriculaValidator):
 * - estudiante_id (requerido)
 * - carrera_id (opcional; requerido solo si el estudiante no tiene carrera fija)
 * - plan_estudio_id (opcional)
 *
 * Respuesta: data.contexto (dataFieldName 'contexto' — §3-A3 del plan
 * docs/plan/matricula-wizard-rediseno.md).
 */
export class GetMatriculaContextoController {
  constructor({ getMatriculaContextoUseCase, logger, responseFormatter }) {
    this.getMatriculaContextoUseCase = getMatriculaContextoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const estudianteId = parseInt(req.query.estudiante_id, 10);
      const carreraId =
        req.query.carrera_id != null && req.query.carrera_id !== ''
          ? parseInt(req.query.carrera_id, 10)
          : null;
      const planEstudioId =
        req.query.plan_estudio_id != null && req.query.plan_estudio_id !== ''
          ? parseInt(req.query.plan_estudio_id, 10)
          : null;

      this.logger.info('[Inscripciones] Request de contexto de matrícula', {
        estudianteId,
        carreraId,
        planEstudioId,
      });

      const contexto = await this.getMatriculaContextoUseCase.execute({
        estudianteId,
        carreraId,
        planEstudioId,
      });

      return this.responseFormatter.retrieved(
        res,
        { contexto },
        'contexto de matrícula',
        estudianteId,
        req
      );
    } catch (error) {
      this.logger.error('[Inscripciones] Error al obtener contexto de matrícula', {
        error: error.message,
        stack: error.stack,
        query: req.query,
      });
      return next(error);
    }
  }
}
