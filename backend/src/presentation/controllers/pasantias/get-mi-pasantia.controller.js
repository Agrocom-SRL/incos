/**
 * GET /api/v1/pasantias/mi-pasantia (P19)
 * Ficha compuesta { pasantia, informes, seguimientos } del estudiante de la
 * SESIÓN (portal del estudiante; pasantia = null si no tiene trámite).
 * El estudiante se resuelve en servidor (anti-IDOR).
 */
export class GetMiPasantiaController {
  constructor({ getMiPasantiaUseCase, logger, responseFormatter }) {
    this.getMiPasantiaUseCase = getMiPasantiaUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      this.logger.info('[Pasantías] Mi pasantía solicitada', { usuarioId });

      const data = await this.getMiPasantiaUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mi pasantía obtenida correctamente' },
        req
      );
    } catch (error) {
      this.logger.error('[Pasantías] Error al obtener mi pasantía', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }
}
