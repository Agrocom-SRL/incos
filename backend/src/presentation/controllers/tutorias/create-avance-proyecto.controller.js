/**
 * POST /api/v1/proyectos-grado/:id/avances (T20)
 * Sube un archivo de avance (multipart uploadAvanceProyecto, campo `archivo`).
 * Guard integrante si el usuario es estudiante (lo aplica el use case).
 * dataFieldName: 'avance'.
 */
export class CreateAvanceProyectoController {
  constructor({ createAvanceProyectoUseCase, logger, responseFormatter }) {
    this.createAvanceProyectoUseCase = createAvanceProyectoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const proyectoGradoId = parseInt(req.params.id, 10);
      const usuarioId = req.usuario?.id;
      this.logger.info('[Tutorías] Request de subida de avance', {
        proyectoGradoId,
        hasFile: Boolean(req.file),
      });

      const result = await this.createAvanceProyectoUseCase.execute({
        proyectoGradoId,
        body: req.body || {},
        file: req.file,
        usuarioId,
      });

      return this.responseFormatter.created(
        res,
        result.avance,
        'avance del proyecto',
        result.avance?.id ?? 'nuevo',
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al subir avance', {
        error: error.message,
        stack: error.stack,
        id: req.params?.id,
      });
      return next(error);
    }
  }
}
