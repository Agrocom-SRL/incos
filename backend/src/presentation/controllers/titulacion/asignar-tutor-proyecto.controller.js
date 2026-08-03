/**
 * POST /api/v1/proyectos-grado/:id/tutor (T10)
 * Asigna tutor + genera PDF de designación oficial (dictamen
 * DESIGNACION_OFICIAL). dataFieldName: 'proyectoGrado'.
 */
export class AsignarTutorProyectoController {
  constructor({ asignarTutorProyectoUseCase, logger, responseFormatter }) {
    this.asignarTutorProyectoUseCase = asignarTutorProyectoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de asignación de tutor', {
        id,
        tutorId: req.body?.tutorId,
      });

      const result = await this.asignarTutorProyectoUseCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(res, result.proyectoGrado, 'proyecto de grado', id, req);
    } catch (error) {
      this.logger.error('[Tutorías] Error al asignar tutor', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
