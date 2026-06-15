/**
 * GET /api/v1/docentes/:id/carga-gestion?gestion_id=
 */

export class GetDocenteCargaGestionController {
  constructor({ getDocenteCargaGestionUseCase, logger, responseFormatter }) {
    this.useCase = getDocenteCargaGestionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const docenteId = parseInt(req.params.id, 10);
      const gestionId = parseInt(String(req.query.gestion_id), 10);

      const cargaGestion = await this.useCase.execute({ docenteId, gestionId });

      return this.responseFormatter._success(res, { carga_gestion: cargaGestion }, {}, req);
    } catch (error) {
      this.logger.error('Error al obtener carga de gestión del docente', {
        error: error.message,
        docenteId: req.params.id,
        gestionId: req.query.gestion_id,
      });
      return next(error);
    }
  }
}
