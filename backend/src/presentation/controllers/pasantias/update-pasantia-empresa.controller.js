/**
 * PUT /api/v1/pasantias/empresas/:empresaId (P9)
 * Edita una empresa del catálogo. dataFieldName: 'pasantiaEmpresa'.
 */
export class UpdatePasantiaEmpresaController {
  constructor({ updatePasantiaEmpresaUseCase, logger, responseFormatter }) {
    this.updatePasantiaEmpresaUseCase = updatePasantiaEmpresaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const empresaId = parseInt(req.params.empresaId, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de edición de empresa', { empresaId });

      const result = await this.updatePasantiaEmpresaUseCase.execute(
        empresaId,
        req.body || {},
        userId
      );

      return this.responseFormatter.updated(
        res,
        result.pasantiaEmpresa,
        'empresa de pasantía',
        empresaId,
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al editar empresa', {
        error: error.message,
        stack: error.stack,
        empresaId: req.params?.empresaId,
      });
      return next(error);
    }
  }
}
