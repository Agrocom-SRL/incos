/**
 * GET /api/v1/asistencia/consolidado?paraleloGestionId=<entero>[&bimestre=1..4]
 * Consolidado % de asistencia del paralelo (sin bimestre = acumulado anual).
 * Permiso: academico.asistencia.consolidado.ver · LISTAR.
 */
export class GetConsolidadoAsistenciaController {
  constructor({ getConsolidadoAsistenciaUseCase, logger, responseFormatter }) {
    this.getConsolidadoAsistenciaUseCase = getConsolidadoAsistenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { paraleloGestionId, bimestre } = req.query;

      this.logger.info('[Asistencia] Consolidado % por paralelo', {
        paraleloGestionId,
        bimestre,
      });

      const payload = await this.getConsolidadoAsistenciaUseCase.execute({
        paraleloGestionId,
        bimestre,
      });

      return this.responseFormatter._success(
        res,
        payload,
        { message: 'Consolidado de asistencia obtenido correctamente' },
        req,
      );
    } catch (error) {
      this.logger.error('[Asistencia] Error consolidado % por paralelo', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default GetConsolidadoAsistenciaController;
