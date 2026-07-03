/**
 * GET /api/v1/dashboard/mi-resumen-docente
 * Resumen del panel del docente de la SESIÓN (autoservicio, como /auth/me).
 *
 * El docente se resuelve en servidor desde req.usuario.id (evita IDOR). El gate
 * es solo `authenticate`: el vínculo usuario↔docente blinda el acceso (403 si no
 * hay vínculo), por eso NO se usa el permiso admin del dashboard.
 */
export class GetMiDashboardResumenDocenteController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/dashboard/GetMiDashboardResumenDocenteUseCase.js').GetMiDashboardResumenDocenteUseCase} params.getMiDashboardResumenDocenteUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getMiDashboardResumenDocenteUseCase, logger, responseFormatter }) {
    this.getMiDashboardResumenDocenteUseCase = getMiDashboardResumenDocenteUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;

      const data = await this.getMiDashboardResumenDocenteUseCase.execute({ usuarioId });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mi resumen docente del dashboard obtenido correctamente' },
        req
      );
    } catch (error) {
      return next(error);
    }
  }
}

export default GetMiDashboardResumenDocenteController;
