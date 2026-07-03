/**
 * GET /api/v1/docentes/mis-datos
 * Identidad mínima del docente de la sesión (portal del rol docente).
 *
 * El docente se resuelve en servidor desde req.usuario.id (el use case lo hace).
 * No recibe ningún id del cliente. El frontend lo usa para saltar a SU ficha
 * `/docentes/:id` (blindada con docenteSelfOnlyGuard).
 */
export class GetMisDatosDocenteController {
  /**
   * @param {Object} params
   * @param {Object} params.getMisDatosDocenteUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getMisDatosDocenteUseCase, logger, responseFormatter }) {
    this.getMisDatosDocenteUseCase = getMisDatosDocenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;

      this.logger.info('[Docentes] Mis datos solicitado', { usuarioId });

      const data = await this.getMisDatosDocenteUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mis datos de docente obtenidos correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Docentes] Error al obtener mis datos', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}

export default GetMisDatosDocenteController;
