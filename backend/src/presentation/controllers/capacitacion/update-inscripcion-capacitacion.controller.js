/**
 * PUT /api/v1/inscripciones-capacitacion/:id
 * Corrige la inscripción: datos del participante y/o grupo/horario (permiso
 * capacitacion.inscripcion EDITAR). Responde con la ficha completa; dataFieldName:
 * 'inscripcionCapacitacion' (igual que GET /:id).
 */
export class UpdateInscripcionCapacitacionController {
  constructor({ updateInscripcionCapacitacionUseCase, logger, responseFormatter }) {
    this.updateInscripcionCapacitacionUseCase = updateInscripcionCapacitacionUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      const { inscripcionCapacitacion } = await this.updateInscripcionCapacitacionUseCase.execute(
        id,
        req.body || {},
        userId
      );
      return this.responseFormatter.updated(
        res,
        { inscripcionCapacitacion },
        'inscripción de capacitación',
        id,
        req
      );
    } catch (error) {
      this.logger.error('Error al corregir inscripción de capacitación', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
