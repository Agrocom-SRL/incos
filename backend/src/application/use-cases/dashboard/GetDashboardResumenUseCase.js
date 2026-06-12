/**
 * Resumen del dashboard: actividades recientes, últimos docentes y estudiantes, conteos.
 */
export class GetDashboardResumenUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/views/DashboardRepository.js').DashboardRepository} deps.dashboardRepository
   * @param {Object} deps.logger
   */
  constructor({ dashboardRepository, logger }) {
    this.dashboardRepository = dashboardRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} [options]
   * @param {number} [options.actividadesLimit=12]
   * @param {number} [options.ultimosDocentesLimit=10]
   * @param {number} [options.ultimosEstudiantesLimit=10]
   * @param {number} [options.carrerasLimit=10]
   */
  async execute(options = {}) {
    const actividadesLimit = options.actividadesLimit ?? 12;
    const ultimosDocentesLimit = options.ultimosDocentesLimit ?? 10;
    const ultimosEstudiantesLimit = options.ultimosEstudiantesLimit ?? 10;
    const carrerasLimit = options.carrerasLimit ?? 10;

    const [actividades, stats, ultimosDocentes, ultimosEstudiantes, carreras] = await Promise.all([
      this.dashboardRepository.findActividadesRecientes(actividadesLimit),
      this.dashboardRepository.countEstudiantesRegistradosHoyYMes(),
      this.dashboardRepository.findDocentesRecientes(ultimosDocentesLimit),
      this.dashboardRepository.findEstudiantesRecientes(ultimosEstudiantesLimit),
      this.dashboardRepository.findCarrerasDestacadas(carrerasLimit),
    ]);

    this.logger.info('[Dashboard] Resumen generado', {
      actividades: actividades.length,
      estudiantesHoy: stats.hoy,
      estudiantesMes: stats.mes,
    });

    return {
      actividades,
      stats: {
        estudiantesRegistradosHoy: stats.hoy,
        estudiantesRegistradosMes: stats.mes,
      },
      ultimosDocentes,
      ultimosEstudiantes,
      carreras,
    };
  }
}
