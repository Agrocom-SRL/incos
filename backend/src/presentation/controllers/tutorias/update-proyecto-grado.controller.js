/**
 * PUT /api/v1/proyectos-grado/:id (T8)
 * Actualiza datos del proyecto de grado. dataFieldName: 'proyectoGrado'.
 */
export class UpdateProyectoGradoController {
  constructor({ updateProyectoGradoUseCase, logger, responseFormatter }) {
    this.updateProyectoGradoUseCase = updateProyectoGradoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.usuario?.id ?? null;
      this.logger.info('[Tutorías] Request de actualización de proyecto de grado', { id });

      const result = await this.updateProyectoGradoUseCase.execute(id, req.body || {}, userId);

      return this.responseFormatter.updated(res, result.proyectoGrado, 'proyecto de grado', id, req);
    } catch (error) {
      this.logger.error('[Tutorías] Error al actualizar proyecto de grado', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
