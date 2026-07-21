/**
 * POST /api/v1/cursos-capacitacion/:id/cancelar
 * Transición manual de negocio hacia CANCELADO (solo desde PROPUESTO o ABIERTO,
 * evaluado sobre el estado EFECTIVO).
 */
export class CancelarCursoCapacitacionController {
  constructor({ cancelarCursoCapacitacionUseCase, logger, responseFormatter }) {
    this.cancelarCursoCapacitacionUseCase = cancelarCursoCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const result = await this.cancelarCursoCapacitacionUseCase.execute(id, userId);
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
