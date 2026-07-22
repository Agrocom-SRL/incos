/**
 * POST /api/v1/inscripciones-capacitacion/:id/anular
 * Transición manual de negocio hacia ANULADO (permiso capacitacion.inscripcion
 * ACCIÓN EDITAR — no existe acción ANULAR en el vocabulario cerrado de
 * permiso_acciones/roles_permisos) — decisión administrativa explícita, solo
 * desde PENDIENTE o INSCRITO. El pago ya registrado NO se toca (sin reembolso).
 */
export class AnularInscripcionCapacitacionController {
  constructor({ anularInscripcionCapacitacionUseCase, logger, responseFormatter }) {
    this.anularInscripcionCapacitacionUseCase = anularInscripcionCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const body = req.body || {};
      const result = await this.anularInscripcionCapacitacionUseCase.execute(id, body, userId);
      const { inscripcionCapacitacion } = result;
      return this.responseFormatter.updated(
        res,
        inscripcionCapacitacion,
        'inscripción de capacitación',
        inscripcionCapacitacion.id,
        req
      );
    } catch (error) {
      this.logger.error('Error al anular inscripción de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
