/**
 * GET /api/v1/dashboard/mi-resumen
 * Resumen del panel del estudiante de la SESIÓN (autoservicio, como /auth/me).
 *
 * El estudiante se resuelve en servidor desde req.usuario.id (evita IDOR). El gate
 * es solo `authenticate`: el vínculo usuario↔estudiante blinda el acceso (403 si no
 * hay vínculo), por eso NO se usa el permiso admin del dashboard.
 *
 * Query opcional: limite_docentes (10), limite_actividades (10).
 */
export class GetMiDashboardResumenController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/dashboard/GetMiDashboardResumenUseCase.js').GetMiDashboardResumenUseCase} params.getMiDashboardResumenUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getMiDashboardResumenUseCase, logger, responseFormatter }) {
    this.getMiDashboardResumenUseCase = getMiDashboardResumenUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;

      let docentesLimit = parseInt(req.query?.limite_docentes, 10);
      if (Number.isNaN(docentesLimit) || docentesLimit < 1) {
        docentesLimit = 10;
      }
      let actividadesLimit = parseInt(req.query?.limite_actividades, 10);
      if (Number.isNaN(actividadesLimit) || actividadesLimit < 1) {
        actividadesLimit = 10;
      }

      const data = await this.getMiDashboardResumenUseCase.execute({
        usuarioId,
        docentesLimit,
        actividadesLimit,
      });

      return this.responseFormatter._success(
        res,
        data,
        { message: 'Mi resumen del dashboard obtenido correctamente' },
        req
      );
    } catch (error) {
      return next(error);
    }
  }
}

export default GetMiDashboardResumenController;
