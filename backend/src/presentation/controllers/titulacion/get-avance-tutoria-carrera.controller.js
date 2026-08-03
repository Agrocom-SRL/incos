/**
 * GET /api/v1/proyectos-grado/reportes/avance-carrera?gestionId=&carreraId=
 * Requisito 2 — extensión 2026-07-31.
 * Reporte de avance de tutorías por carrera (resumen + detalle por proyecto).
 * dataFieldName: 'avanceTutoriaCarrera'.
 */
export class GetAvanceTutoriaCarreraController {
  constructor({ getAvanceTutoriaCarreraUseCase, logger, responseFormatter }) {
    if (!getAvanceTutoriaCarreraUseCase) {
      throw new Error('getAvanceTutoriaCarreraUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    if (!responseFormatter) {
      throw new Error('responseFormatter es requerido');
    }
    this.getAvanceTutoriaCarreraUseCase = getAvanceTutoriaCarreraUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { gestionId, carreraId } = req.query;
      this.logger.info('[Titulación] Request reporte de avance de tutorías por carrera', {
        gestionId,
        carreraId,
      });

      const data = await this.getAvanceTutoriaCarreraUseCase.execute({ gestionId, carreraId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Reporte de avance de tutorías por carrera obtenido correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Titulación] Error al obtener reporte de avance de tutorías por carrera', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
