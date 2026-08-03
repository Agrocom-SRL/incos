import { PasantiaMapper } from '../../mappers/pasantias/index.js';

/**
 * Use Case: ListPasantiasUseCase (P1)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Lista trámites de pasantía/convalidación desde la vista 167
 * (vista_pasantias_listado) con filtros y paginación.
 *
 * Contrato compatible con BaseListController:
 * execute(baseFilters, page, limit, queryParams) →
 * { pasantias, total, page, limit, totalPages }.
 */
export class ListPasantiasUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaViewRepository - Vistas 167/168
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaViewRepository, logger }) {
    this.pasantiaViewRepository = pasantiaViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} baseFilters - { search } normalizados por ListRequestDTO
   * @param {number} page
   * @param {number} limit
   * @param {Object} queryParams - carreraId, gestionId, estado, tipo,
   *   docenteSupervisorId, estudianteId
   * @returns {Promise<{pasantias: Array, total: number, page: number, limit: number, totalPages: number}>}
   */
  async execute(baseFilters = {}, page = 1, limit = 50, queryParams = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const filters = {
      search: baseFilters.search,
      carreraId: queryParams.carreraId ? Number(queryParams.carreraId) : undefined,
      gestionId: queryParams.gestionId ? Number(queryParams.gestionId) : undefined,
      estado: queryParams.estado || undefined,
      tipo: queryParams.tipo || undefined,
      docenteSupervisorId: queryParams.docenteSupervisorId
        ? Number(queryParams.docenteSupervisorId)
        : undefined,
      estudianteId: queryParams.estudianteId ? Number(queryParams.estudianteId) : undefined,
    };

    const { rows, total } = await this.pasantiaViewRepository.findListado(
      filters,
      pageNum,
      limitNum
    );

    this.logger.info('[Pasantías] Trámites listados', { total, count: rows.length });

    return {
      pasantias: PasantiaMapper.listadoRowsToPresentation(rows),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
