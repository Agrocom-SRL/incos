/**
 * GET /api/v1/dashboard/resumen
 * Datos agregados para la página principal (actividades, últimos docentes/estudiantes, conteos).
 *
 * Query opcional: limite_actividades (default 12), limite_ultimos_docentes, limite_ultimos_estudiantes (default 10).
 */
export class GetDashboardResumenController {
  /**
   * @param {Object} params
   * @param {import('../../../application/use-cases/dashboard/GetDashboardResumenUseCase.js').GetDashboardResumenUseCase} params.getDashboardResumenUseCase
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({ getDashboardResumenUseCase, logger, responseFormatter }) {
    this.getDashboardResumenUseCase = getDashboardResumenUseCase;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      let limiteActividades = parseInt(req.query.limite_actividades, 10);
      if (Number.isNaN(limiteActividades) || limiteActividades < 1) {
        limiteActividades = 12;
      }
      let limiteUltimosDocentes = parseInt(req.query.limite_ultimos_docentes, 10);
      if (Number.isNaN(limiteUltimosDocentes) || limiteUltimosDocentes < 1) {
        limiteUltimosDocentes = 10;
      }
      let limiteUltimosEstudiantes = parseInt(req.query.limite_ultimos_estudiantes, 10);
      if (Number.isNaN(limiteUltimosEstudiantes) || limiteUltimosEstudiantes < 1) {
        limiteUltimosEstudiantes = 10;
      }

      const data = await this.getDashboardResumenUseCase.execute({
        actividadesLimit: limiteActividades,
        ultimosDocentesLimit: limiteUltimosDocentes,
        ultimosEstudiantesLimit: limiteUltimosEstudiantes,
      });

      return this.responseFormatter.retrieved(res, data, 'resumen del dashboard', 'actual', req);
    } catch (error) {
      next(error);
    }
  }
}
