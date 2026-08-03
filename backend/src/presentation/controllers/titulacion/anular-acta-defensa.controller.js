/**
 * PATCH /api/v1/proyectos-grado/:id/acta-defensa/:actaId/anular
 * Anula un acta de defensa EMITIDA (decisión administrativa manual, P8).
 * NO revierte la transición del proyecto.
 * dataFieldName: 'actaDefensa'.
 */
export class AnularActaDefensaController {
  constructor({ anularActaDefensaUseCase, logger, responseFormatter }) {
    this.anularActaDefensaUseCase = anularActaDefensaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const actaId = parseInt(req.params.actaId, 10);
      const userId = req.usuario?.id ?? null;
      const { motivo } = req.body || {};
      this.logger.info('[Titulación] Request de anulación de acta de defensa', {
        proyectoGradoId,
        actaId,
      });

      const result = await this.anularActaDefensaUseCase.execute(
        proyectoGradoId,
        actaId,
        motivo,
        userId
      );

      return this.responseFormatter._success(
        res,
        result,
        { statusCode: 200, message: 'Acta de defensa anulada correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Titulación] Error al anular acta de defensa', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
        actaId: req.params?.actaId,
      });
      return next(error);
    }
  }
}
