/**
 * GET /api/v1/proyectos-grado/reportes/planilla-avance-tercer-anio?carreraId=&gestionId=&bimestre=
 * Requisito 3 — extensión 2026-07-31.
 * Planilla de avance de tutorías "10 en 10" (bimestral, 3er año): preview
 * en pantalla (folios + resumen de tutores + tally).
 * dataFieldName: 'planillaAvanceTercerAnio'.
 */
export class GetPlanillaAvanceTercerAnioController {
  constructor({ getPlanillaAvanceTercerAnioUseCase, logger, responseFormatter }) {
    if (!getPlanillaAvanceTercerAnioUseCase) {
      throw new Error('getPlanillaAvanceTercerAnioUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    if (!responseFormatter) {
      throw new Error('responseFormatter es requerido');
    }
    this.getPlanillaAvanceTercerAnioUseCase = getPlanillaAvanceTercerAnioUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { carreraId, gestionId, bimestre } = req.query;
      this.logger.info('[Titulación] Request planilla de avance de tutorías (3er año)', {
        carreraId,
        gestionId,
        bimestre,
      });

      const data = await this.getPlanillaAvanceTercerAnioUseCase.execute({
        carreraId,
        gestionId,
        bimestre,
      });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Planilla de avance de tutorías obtenida correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Titulación] Error al obtener planilla de avance de tutorías', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
