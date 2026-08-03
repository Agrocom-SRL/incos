import { RiesgoAcademicoMapper } from '../../../mappers/academico/index.js';

/**
 * Use Case: ListAlertasRiesgoUseCase (A1)
 * Módulo: Académico (ACA · acompañamiento)
 *
 * Lista alertas de riesgo pedagógico (vista 156, en_riesgo = 1) con filtros
 * y paginación. Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { alertasRiesgo, total, page, limit, totalPages }.
 */
export class ListAlertasRiesgoUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.riesgoAcademicoViewRepository - Vistas 156/157/158
   * @param {ILogger} params.logger
   */
  constructor({ riesgoAcademicoViewRepository, logger }) {
    this.riesgoAcademicoViewRepository = riesgoAcademicoViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search }
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - gestionId, carreraId, paraleloGestionId, incluirSinRiesgo
   * @returns {Promise<{alertasRiesgo: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const filters = {
      search: baseFilters.search,
      gestionId: queryParams.gestionId ? Number(queryParams.gestionId) : undefined,
      carreraId: queryParams.carreraId ? Number(queryParams.carreraId) : undefined,
      paraleloGestionId: queryParams.paraleloGestionId
        ? Number(queryParams.paraleloGestionId)
        : undefined,
      soloEnRiesgo: !(
        queryParams.incluirSinRiesgo === 'true' || queryParams.incluirSinRiesgo === true
      ),
    };

    const { rows, total } = await this.riesgoAcademicoViewRepository.findAlertas(
      filters,
      pageNum,
      limitNum
    );

    this.logger.info('[Acompañamiento] Alertas de riesgo listadas', { total, count: rows.length });

    return {
      alertasRiesgo: RiesgoAcademicoMapper.alertaRowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
