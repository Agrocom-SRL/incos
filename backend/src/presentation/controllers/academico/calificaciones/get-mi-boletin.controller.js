/**
 * GET /api/v1/calificaciones/mi-boletin
 * Boletín de calificaciones del estudiante de la sesión (gestión vigente).
 * El estudiante se resuelve en servidor desde req.usuario.id (lo hace el use case).
 */
export class GetMiBoletinEstudianteController {
  /**
   * @param {Object} params
   * @param {Object} params.getMiBoletinEstudianteUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getMiBoletinEstudianteUseCase, logger, responseFormatter }) {
    this.getMiBoletinEstudianteUseCase = getMiBoletinEstudianteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;

      this.logger.info('[Calificaciones] Mi boletín solicitado', { usuarioId });

      const data = await this.getMiBoletinEstudianteUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mi boletín obtenido correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Calificaciones] Error al obtener mi boletín', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default GetMiBoletinEstudianteController;
