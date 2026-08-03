/**
 * PATCH /api/v1/proyectos-grado/:id/integrantes/:integranteId (T13)
 * Actualiza un integrante del proyecto (rol, estado ACTIVO/RETIRADO).
 * dataFieldName: 'integrante'.
 */
export class UpdateIntegranteProyectoController {
  constructor({ updateIntegranteProyectoUseCase, logger, responseFormatter }) {
    this.updateIntegranteProyectoUseCase = updateIntegranteProyectoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const integranteId = parseInt(req.params.integranteId, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de actualización de integrante', {
        proyectoGradoId,
        integranteId,
      });

      const result = await this.updateIntegranteProyectoUseCase.execute(
        proyectoGradoId,
        integranteId,
        req.body || {},
        userId
      );

      return this.responseFormatter.updated(
        res,
        result.integrante,
        'integrante del proyecto',
        integranteId,
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al actualizar integrante', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
