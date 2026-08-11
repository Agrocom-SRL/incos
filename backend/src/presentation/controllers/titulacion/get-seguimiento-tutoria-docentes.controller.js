/**
 * GET /api/v1/proyectos-grado/reportes/seguimiento-tutoria-docentes?docenteId=&carreraId=&anio=&mes=
 * Extensión 2026-08-10 (reemplaza la planilla de avance "10 en 10" de 3er
 * año). Reporte ADMINISTRATIVO de seguimiento de tutorías A LOS DOCENTES:
 * preview en pantalla, agrupado por docente-tutor.
 * dataFieldName: 'seguimientoTutoriaDocentes'.
 */
export class GetSeguimientoTutoriaDocentesController {
  constructor({ getSeguimientoTutoriaDocentesUseCase, logger, responseFormatter }) {
    if (!getSeguimientoTutoriaDocentesUseCase) {
      throw new Error('getSeguimientoTutoriaDocentesUseCase es requerido');
    }
    if (!logger) {
      throw new Error('logger es requerido');
    }
    if (!responseFormatter) {
      throw new Error('responseFormatter es requerido');
    }
    this.getSeguimientoTutoriaDocentesUseCase = getSeguimientoTutoriaDocentesUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const { docenteId, carreraId, anio, mes } = req.query;
      this.logger.info('[Titulación] Request seguimiento de tutorías a docentes', {
        docenteId,
        carreraId,
        anio,
        mes,
      });

      const data = await this.getSeguimientoTutoriaDocentesUseCase.execute({
        docenteId,
        carreraId,
        anio,
        mes,
      });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Seguimiento de tutorías a docentes obtenido correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Titulación] Error al obtener seguimiento de tutorías a docentes', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
