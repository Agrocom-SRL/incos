/**
 * GET /api/v1/horarios/docentes/:docenteId/grilla-conflictos?gestion_id=
 */
export class GetDocenteGrillaConflictosController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const docenteId = parseInt(req.params.docenteId, 10);
      const gestionId = req.query.gestion_id ?? req.query.gestionId;
      const data = await this.useCase.execute(docenteId, gestionId);
      return this.responseFormatter._success(res, data, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}
