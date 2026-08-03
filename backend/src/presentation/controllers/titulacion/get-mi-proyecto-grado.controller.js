/**
 * GET /api/v1/proyectos-grado/mi-proyecto (T4)
 * Ficha del proyecto vigente del estudiante de la SESIÓN (portal del
 * estudiante). dataFieldName: 'proyectoGrado' (null si no tiene proyecto).
 * El estudiante se resuelve en servidor (anti-IDOR).
 */
export class GetMiProyectoGradoController {
  constructor({ getMiProyectoGradoUseCase, logger, responseFormatter }) {
    this.getMiProyectoGradoUseCase = getMiProyectoGradoUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      this.logger.info('[Tutorías] Mi proyecto solicitado', { usuarioId });

      const data = await this.getMiProyectoGradoUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mi proyecto obtenido correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Tutorías] Error al obtener mi proyecto', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
