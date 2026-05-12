import {
  buildHorariosParaleloDashboardKpis,
  computeHorariosParaleloBoardBucket,
} from '../../utils/horariosParaleloBoardBucket.js';

export class GetParalelosEstadoDashboardUseCase {
  constructor({ parallelRepository, logger }) {
    this.parallelRepository = parallelRepository;
    this.logger = logger;
  }

  async execute(filters = {}) {
    this.logger.info('[Academico] Dashboard horarios - paralelos estado', { filters });
    const rows = await this.parallelRepository.obtenerParalelosEstadoDashboard(filters);
    const list = Array.isArray(rows) ? rows : [];
    const paralelos = list.map((r) => ({
      ...r,
      board_bucket: r.tablero_grupo || computeHorariosParaleloBoardBucket(r),
    }));
    const kpis = buildHorariosParaleloDashboardKpis(paralelos);
    return { paralelos, kpis };
  }
}
