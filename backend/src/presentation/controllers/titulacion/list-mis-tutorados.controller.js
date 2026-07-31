/**
 * GET /api/v1/proyectos-grado/mis-tutorados (T3)
 * Bandeja del tutor de la SESIÓN (vista 160 WHERE tutor_id).
 * dataFieldName: 'misTutorados'. El docente se resuelve en servidor (anti-IDOR).
 */
export class ListMisTutoradosController {
  constructor({ listMisTutoradosUseCase, logger, responseFormatter }) {
    this.listMisTutoradosUseCase = listMisTutoradosUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      this.logger.info('[Tutorías] Mis tutorados solicitado', { usuarioId });

      const data = await this.listMisTutoradosUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mis tutorados obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al obtener mis tutorados', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
