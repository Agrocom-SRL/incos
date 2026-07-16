/**
 * PUT /api/v1/cursos-capacitacion/:id
 * Actualiza un curso de capacitación; si el body trae `horarioIds`, reemplaza
 * la junction `capacitacion_horarios`.
 */
export class UpdateCursoCapacitacionController {
  constructor({ updateCursoCapacitacionUseCase, logger, responseFormatter }) {
    this.updateCursoCapacitacionUseCase = updateCursoCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const body = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.updateCursoCapacitacionUseCase.execute(id, body, userId);
      const { cursoCapacitacion } = result;
      return this.responseFormatter.updated(
        res,
        cursoCapacitacion,
        'curso de capacitación',
        cursoCapacitacion.id,
        req
      );
    } catch (error) {
      return next(error);
    }
  }
}
