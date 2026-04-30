export class GetCapacidadTurnoDashboardUseCase {
  constructor({ parallelRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.logger = logger;
  }

  async execute() {
    this.logger.info('[Academico] Dashboard horarios - capacidad por turno');
    const rows = await this.parallelRepository.obtenerCapacidadTurnoDashboard();
    return rows || [];
  }
}
