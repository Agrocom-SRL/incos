/**
 * POST /api/v1/bancos-autorizados
 * Crea un banco autorizado.
 *
 * Permiso: finanzas.configuracion.pago (CREAR).
 * Body: metodo_pago_id?, codigo (req), nombre (req), activo?
 * Contrato: data.bancoAutorizado = banco creado.
 */
export class CreateBancoAutorizadoController {
  constructor({ createAuthorizedBankUseCase, logger, responseFormatter }) {
    this.createAuthorizedBankUseCase = createAuthorizedBankUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
    this.dataFieldName = 'bancoAutorizado';
    this.resourceName = 'banco autorizado';
  }

  async handle(req, res, next) {
    try {
      const userId = req.usuario?.id ?? null;
      const banco = await this.createAuthorizedBankUseCase.execute(req.body || {}, userId);

      return this.responseFormatter.created(
        res,
        { [this.dataFieldName]: banco },
        this.resourceName,
        banco?.id,
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al crear banco autorizado', {
        error: error.message,
        body: req.body,
      });
      return next(error);
    }
  }
}
