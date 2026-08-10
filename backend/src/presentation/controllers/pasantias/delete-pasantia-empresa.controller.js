/**
 * DELETE /api/v1/pasantias/empresas/:empresaId (P21)
 * Elimina (soft) una empresa del catálogo.
 */
export class DeletePasantiaEmpresaController {
  constructor({ deletePasantiaEmpresaUseCase, logger, responseFormatter }) {
    this.deletePasantiaEmpresaUseCase = deletePasantiaEmpresaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const empresaId = parseInt(req.params.empresaId, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de eliminación de empresa', { empresaId });

      await this.deletePasantiaEmpresaUseCase.execute(empresaId, userId);

      return this.responseFormatter.deleted(res, 'empresa de pasantía', empresaId, req);
    } catch (error) {
      this.logger.error('[Pasantías] Error al eliminar empresa', {
        error: error.message,
        stack: error.stack,
        empresaId: req.params?.empresaId,
      });
      return next(error);
    }
  }
}
