/**
 * Resumen del dashboard: actividades recientes (incluye altas de participantes e inscripciones de
 * capacitación), últimos docentes y estudiantes, conteos de estudiantes y de participantes.
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

    const [actividades, stats, statsParticipantes, ultimosDocentes, ultimosEstudiantes, carreras] = await Promise.all([
      this.dashboardRepository.findActividadesRecientes(actividadesLimit),
      this.dashboardRepository.countEstudiantesRegistradosHoyYMes(),
      this.dashboardRepository.countParticipantesRegistradosHoyYMes(),
      this.dashboardRepository.findDocentesRecientes(ultimosDocentesLimit),
      this.dashboardRepository.findEstudiantesRecientes(ultimosEstudiantesLimit),
      this.dashboardRepository.findCarrerasDestacadas(carrerasLimit),
    ]);

    this.logger.info('[Dashboard] Resumen generado', {
      actividades: actividades.length,
      estudiantesHoy: stats.hoy,
      estudiantesMes: stats.mes,
      participantesHoy: statsParticipantes.hoy,
      participantesMes: statsParticipantes.mes,
    });

    return {
      actividades,
      stats: {
        estudiantesRegistradosHoy: stats.hoy,
        estudiantesRegistradosMes: stats.mes,
        participantesRegistradosHoy: statsParticipantes.hoy,
        participantesRegistradosMes: statsParticipantes.mes,
      },
      ultimosDocentes,
      ultimosEstudiantes,
      carreras,
    };
  }
}
