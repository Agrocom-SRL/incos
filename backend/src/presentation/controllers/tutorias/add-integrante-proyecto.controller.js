/**
 * POST /api/v1/proyectos-grado/:id/integrantes (T12)
 * Agrega un integrante al proyecto (solo modalidad grupal PSP admite varios).
 * dataFieldName: 'integrante'.
 */
export class AddIntegranteProyectoController {
  constructor({ addIntegranteProyectoUseCase, logger, responseFormatter }) {
    this.addIntegranteProyectoUseCase = addIntegranteProyectoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de alta de integrante', {
        proyectoGradoId,
        estudianteId: req.body?.estudianteId,
      });

      const result = await this.addIntegranteProyectoUseCase.execute(
        proyectoGradoId,
        req.body || {},
        userId
      );

      return this.responseFormatter.created(
        res,
        result.integrante,
        'integrante del proyecto',
        result.integrante?.id ?? 'nuevo',
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al agregar integrante', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
