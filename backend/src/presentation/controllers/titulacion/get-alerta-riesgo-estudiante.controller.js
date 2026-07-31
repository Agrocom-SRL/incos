/**
 * GET /api/v1/acompanamiento/alertas/estudiante/:estudianteId (A3)
 * Detalle de riesgo de un estudiante (todas sus materias, vista 156).
 * dataFieldName: 'alertaEstudiante'.
 */
export class GetAlertaRiesgoEstudianteController {
  constructor({ getAlertaRiesgoEstudianteUseCase, logger, responseFormatter }) {
    this.getAlertaRiesgoEstudianteUseCase = getAlertaRiesgoEstudianteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const estudianteId = parseInt(req.params.estudianteId, 10);
      this.logger.info('[Tutorías] Request de detalle de alerta de estudiante', { estudianteId });

      const result = await this.getAlertaRiesgoEstudianteUseCase.execute(estudianteId, req.query);

      return this.responseFormatter.retrieved(
        res,
        result,
        'alerta de riesgo del estudiante',
        estudianteId,
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al obtener detalle de alerta', {
        error: error.message,
        stack: error.stack,
        estudianteId: req.params?.estudianteId,
      });
      return next(error);
    }
  }
}
