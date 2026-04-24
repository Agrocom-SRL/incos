/**
 * Orquesta la carga del resumen del panel principal (actividades, docentes, conteos).
 */
export class ObtenerDashboardResumenUseCase {
  constructor({ dashboardRepository }) {
    this.dashboardRepository = dashboardRepository;
  }

  /**
   * @param {Object} [params] - limite_actividades, limite_docentes (query API)
   */
  async ejecutar(params = {}) {
    return this.dashboardRepository.obtenerResumen(params);
  }
}
