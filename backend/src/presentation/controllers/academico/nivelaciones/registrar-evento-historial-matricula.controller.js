/**
 * POST /api/v1/nivelaciones/eventos — evento genérico de historial_matricula
 * (transiciones sin nota: VENCIDA, CHOQUE_HORARIO, HOMOLOGACION, etc.).
 * ABANDONO/RETIRADO usan /nivelaciones/decisiones-administrativas.
 */
export class RegistrarEventoHistorialMatriculaController {
  constructor({ registrarEventoHistorialMatriculaUseCase, logger, responseFormatter }) {
    this.registrarEventoHistorialMatriculaUseCase = registrarEventoHistorialMatriculaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const resultado = await this.registrarEventoHistorialMatriculaUseCase.execute({
        usuarioId: req.user?.id ?? null,
        ...req.body,
      });

      return this.responseFormatter._success(
        res,
        resultado,
        { statusCode: 201, message: 'Evento de historial de matrícula registrado' },
        req,
      );
    } catch (error) {
      this.logger.error('[Nivelaciones] Error POST evento de historial', {
        error: error.message,
      });
      return next(error);
    }
  }
}

export default RegistrarEventoHistorialMatriculaController;
