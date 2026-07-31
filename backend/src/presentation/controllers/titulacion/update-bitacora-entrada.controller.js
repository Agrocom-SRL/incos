/**
 * PUT /api/v1/proyectos-grado/:id/bitacora/:entradaId (T16)
 * Actualiza una entrada de bitácora. dataFieldName: 'bitacoraEntrada'.
 */
export class UpdateBitacoraEntradaController {
  constructor({ updateBitacoraEntradaUseCase, logger, responseFormatter }) {
    this.updateBitacoraEntradaUseCase = updateBitacoraEntradaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const entradaId = parseInt(req.params.entradaId, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de actualización de entrada de bitácora', {
        proyectoGradoId,
        entradaId,
      });

      const result = await this.updateBitacoraEntradaUseCase.execute(
        proyectoGradoId,
        entradaId,
        req.body || {},
        userId
      );

      return this.responseFormatter.updated(
        res,
        result.bitacoraEntrada,
        'entrada de bitácora',
        entradaId,
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al actualizar entrada de bitácora', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
