/**
 * PUT /api/v1/asistencia/licencias/:id
 */
export class EditarLicenciaController {
  constructor({ editarLicenciaUseCase, logger, responseFormatter }) {
    this.editarLicenciaUseCase = editarLicenciaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.editarLicenciaUseCase.execute({
        usuarioId: req.usuario.id,
        id: Number(req.params.id),
        body: req.body ?? {},
      });
      return this.responseFormatter._success(
        res,
        resultado,
        { message: 'Licencia actualizada' },
        req,
      );
    } catch (error) {
      this.logger.error('[Licencias] Error PUT editar', { error: error.message });
      return next(error);
    }
  }
}

export default EditarLicenciaController;
