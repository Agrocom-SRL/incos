/**
 * GET /api/v1/paralelos-gestion/:id/grilla-horario
 */
export class GetParaleloGestionGrillaHorarioController {
  constructor({ useCase, responseFormatter }) {
    this.useCase = useCase;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const grilla = await this.useCase.execute(id);
      return this.responseFormatter._success(res, grilla, {}, req);
    } catch (e) {
      return next(e);
    }
  }
}
