/**
 * PUT /api/v1/docentes/:id/color
 */

export class UpdateDocenteColorController {
  constructor({ updateDocenteColorUseCase, logger, responseFormatter }) {
    this.useCase = updateDocenteColorUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const docenteId = parseInt(req.params.id, 10);
      const body = req.body || {};
      const colorHex = body.color_hex ?? body.colorHex;

      const docenteColor = await this.useCase.execute(
        { docenteId, colorHex },
        req.user?.id ?? null
      );

      return this.responseFormatter._success(res, { docente_color: docenteColor }, {}, req);
    } catch (error) {
      this.logger.error('Error al actualizar color del docente', {
        error: error.message,
        docenteId: req.params.id,
      });
      return next(error);
    }
  }
}
