/**
 * POST /api/v1/cursos-capacitacion/:id/abrir
 * Transición manual de negocio: PROPUESTO → ABIERTO ("abrir inscripciones").
 */
export class AbrirCursoCapacitacionController {
  constructor({ abrirCursoCapacitacionUseCase, logger, responseFormatter }) {
    this.abrirCursoCapacitacionUseCase = abrirCursoCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const result = await this.abrirCursoCapacitacionUseCase.execute(id, userId);
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
