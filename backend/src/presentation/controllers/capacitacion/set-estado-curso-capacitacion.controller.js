/**
 * PATCH /api/v1/cursos-capacitacion/:id/estado
 * Activa/desactiva un curso de capacitación (body: { activo: boolean }) —
 * patrón EstadoTogglePill, mismo contrato que los catálogos de configuración.
 */
export class SetEstadoCursoCapacitacionController {
  constructor({ setEstadoCursoCapacitacionUseCase, logger, responseFormatter }) {
    this.setEstadoCursoCapacitacionUseCase = setEstadoCursoCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { activo } = req.body || {};
      const userId = req.usuario?.id ?? null;
      const result = await this.setEstadoCursoCapacitacionUseCase.execute(id, activo, userId);
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
