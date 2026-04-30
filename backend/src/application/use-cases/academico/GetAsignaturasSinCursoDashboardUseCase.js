export class GetAsignaturasSinCursoDashboardUseCase {
  constructor({ parallelRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.logger = logger;
  }

  async execute() {
    this.logger.info('[Academico] Dashboard horarios - asignaturas sin curso');
    const rows = await this.parallelRepository.obtenerAsignaturasSinCursoDashboard();
    return rows || [];
  }
}
