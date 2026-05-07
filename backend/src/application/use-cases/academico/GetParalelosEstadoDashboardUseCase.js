export class GetParalelosEstadoDashboardUseCase {
  constructor({ parallelRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.logger = logger;
  }

  async execute(filters = {}) {
    this.logger.info('[Academico] Dashboard horarios - paralelos estado', { filters });
    const rows = await this.parallelRepository.obtenerParalelosEstadoDashboard(filters);
    return rows || [];
  }
}
