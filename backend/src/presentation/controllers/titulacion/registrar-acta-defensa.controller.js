/**
 * POST /api/v1/proyectos-grado/:id/acta-defensa
 * Registra el/los acta(s) de defensa del proyecto (N si PSP grupal) y
 * delega la transición DEFENSA → APROBADO|REPROBADO en T11.
 * dataFieldName: 'actasDefensa'.
 */
export class RegistrarActaDefensaController {
  constructor({ registrarActaDefensaUseCase, logger, responseFormatter }) {
    this.registrarActaDefensaUseCase = registrarActaDefensaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Titulación] Request de registro de acta de defensa', {
        proyectoGradoId,
      });

      const result = await this.registrarActaDefensaUseCase.execute(
        proyectoGradoId,
        req.body || {},
        userId
      );

      return this.responseFormatter._success(
        res,
        result,
        { statusCode: 201, message: 'Acta de defensa registrada correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Titulación] Error al registrar acta de defensa', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
