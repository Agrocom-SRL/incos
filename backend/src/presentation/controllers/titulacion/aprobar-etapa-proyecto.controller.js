/**
 * POST /api/v1/proyectos-grado/:id/transiciones (T11)
 * Transición de estado del proyecto (emite VIABILIDAD_TECNICA + PDF cuando la
 * transición es a APROBADO). dataFieldName: 'proyectoGrado'.
 */
export class AprobarEtapaProyectoController {
  constructor({ aprobarEtapaProyectoUseCase, logger, responseFormatter }) {
    this.aprobarEtapaProyectoUseCase = aprobarEtapaProyectoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de transición de etapa', {
        id,
        estado: req.body?.estado,
      });

      const result = await this.aprobarEtapaProyectoUseCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(res, result.proyectoGrado, 'proyecto de grado', id, req);
    } catch (error) {
      this.logger.error('[Tutorías] Error en transición de etapa', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
