/**
 * GET /api/v1/estudiantes/mis-datos
 * Datos del estudiante de la sesión (portal del estudiante).
 *
 * El estudiante se resuelve en servidor desde req.usuario.id (el use case lo hace).
 * No recibe ningún id del cliente.
 */
export class GetMisDatosEstudianteController {
  /**
   * @param {Object} params
   * @param {Object} params.getMisDatosEstudianteUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getMisDatosEstudianteUseCase, logger, responseFormatter }) {
    this.getMisDatosEstudianteUseCase = getMisDatosEstudianteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;

      this.logger.info('[Estudiantes] Mis datos solicitado', { usuarioId });

      const data = await this.getMisDatosEstudianteUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mis datos obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Estudiantes] Error al obtener mis datos', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default GetMisDatosEstudianteController;
