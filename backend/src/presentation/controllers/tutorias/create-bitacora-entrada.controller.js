/**
 * POST /api/v1/proyectos-grado/:id/bitacora (T15)
 * Crea una entrada de bitácora (REVISION_AVANCE actualiza el estado del
 * avance vinculado). dataFieldName: 'bitacoraEntrada'.
 */
export class CreateBitacoraEntradaController {
  constructor({ createBitacoraEntradaUseCase, logger, responseFormatter }) {
    this.createBitacoraEntradaUseCase = createBitacoraEntradaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de creación de entrada de bitácora', {
        proyectoGradoId,
        tipo: req.body?.tipo,
      });

      const result = await this.createBitacoraEntradaUseCase.execute(
        proyectoGradoId,
        req.body || {},
        userId
      );

      return this.responseFormatter.created(
        res,
        result.bitacoraEntrada,
        'entrada de bitácora',
        result.bitacoraEntrada?.id ?? 'nueva',
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al crear entrada de bitácora', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
