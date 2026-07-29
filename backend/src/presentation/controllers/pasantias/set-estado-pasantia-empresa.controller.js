/**
 * PATCH /api/v1/pasantias/empresas/:empresaId/estado (P10)
 * Activa/desactiva una empresa del catálogo (body: { activo: boolean }).
 * Permiso: tutorias.pasantia.empresa ACTIVAR. dataFieldName: 'pasantiaEmpresa'.
 */
export class SetEstadoPasantiaEmpresaController {
  constructor({ setEstadoPasantiaEmpresaUseCase, logger, responseFormatter }) {
    this.setEstadoPasantiaEmpresaUseCase = setEstadoPasantiaEmpresaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const empresaId = parseInt(req.params.empresaId, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Pasantías] Request de cambio de estado de empresa', {
        empresaId,
        activo,
      });

      const result = await this.setEstadoPasantiaEmpresaUseCase.execute(empresaId, activo, userId);

      return this.responseFormatter.updated(
        res,
        result.pasantiaEmpresa,
        'empresa de pasantía',
        empresaId,
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al cambiar estado de empresa', {
        error: error.message,
        stack: error.stack,
        empresaId: req.params?.empresaId,
      });
      return next(error);
    }
  }
}
