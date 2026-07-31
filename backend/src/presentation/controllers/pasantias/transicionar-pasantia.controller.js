/**
 * POST /api/v1/pasantias/:id/transiciones (P6)
 * Transición de estado del trámite (máquina de estados por camino).
 * Permiso: titulacion.pasantia APROBAR. dataFieldName: 'pasantia'.
 */
export class TransicionarPasantiaController {
  constructor({ transicionarPasantiaUseCase, logger, responseFormatter }) {
    this.transicionarPasantiaUseCase = transicionarPasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de transición de estado', {
        id,
        estado: req.body?.estado,
      });

      const result = await this.transicionarPasantiaUseCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(res, result.pasantia, 'pasantía', id, req);
    } catch (error) {
      this.logger.error('[Pasantías] Error en transición de estado', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
