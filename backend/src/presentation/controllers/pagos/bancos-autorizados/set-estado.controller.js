/**
 * PATCH /api/v1/bancos-autorizados/:id/estado
 * Activa/desactiva un banco autorizado.
 *
 * Permiso: finanzas.configuracion.pago (ACTIVAR).
 * Body: { activo: boolean }
 * Contrato: data.bancoAutorizado = banco autorizado actualizado.
 */
export class SetEstadoBancoAutorizadoController {
  constructor({ setEstadoBancoAutorizadoUseCase, logger, responseFormatter }) {
    this.setEstadoBancoAutorizadoUseCase = setEstadoBancoAutorizadoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoBancoAutorizadoUseCase.execute(id, activo, userId);
      return this.responseFormatter.updated(res, result, 'banco autorizado', id, req);
    } catch (error) {
      return next(error);
    }
  }
}
