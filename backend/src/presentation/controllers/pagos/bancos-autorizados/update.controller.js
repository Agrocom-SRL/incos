/**
 * PUT /api/v1/bancos-autorizados/:id
 * Edita un banco autorizado (nombre, codigo, metodoPagoId y/o estado activo).
 *
 * Permiso: configuracion.pagos (EDITAR).
 * Body: metodo_pago_id?, codigo?, nombre?, activo?
 * Contrato: data.bancoAutorizado = banco actualizado.
 */
export class UpdateBancoAutorizadoController {
  constructor({ updateAuthorizedBankUseCase, logger, responseFormatter }) {
    this.updateAuthorizedBankUseCase = updateAuthorizedBankUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'bancoAutorizado';
    this.resourceName = 'banco autorizado';
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id ?? null;
      const banco = await this.updateAuthorizedBankUseCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(
        res,
        { [this.dataFieldName]: banco },
        this.resourceName,
        id,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al actualizar banco autorizado', {
        error: error.message,
        params: req.params,
        body: req.body,
      });
      return next(error);
    }
  }
}
